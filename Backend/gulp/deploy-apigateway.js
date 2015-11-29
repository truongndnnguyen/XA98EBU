var AWS = require('aws-sdk'),
    async = require('async');

AWS.config.update({region:'ap-northeast-1'});
var apigateway = new AWS.APIGateway({apiVersion: '2015-07-09'});

var role = 'arn:aws:iam::644368612228:role/sarapp_position_backend_role',
    apiname = 'em-public-backend',
    credentials = 'arn:aws:iam::644368612228:role/em-public-backend-api-gateway',
    account = '644368612228';

function createMethod(endpoint, restapi, resource, cb) {
    async.series([
        function(cb){
            console.log('creating method: '+endpoint.path+', '+endpoint.method);
            return apigateway.putMethod({
                // apiKeyRequired: true || false,
                authorizationType: '', /* required */
                httpMethod: endpoint.method,
                resourceId: resource.id,
                restApiId: restapi.id
            }, cb);
        },
        function(cb){
            console.log('creating integration: '+endpoint.path+', '+endpoint.method);
            var options = {
                httpMethod: endpoint.method,
                resourceId: resource.id,
                restApiId: restapi.id,
                cacheKeyParameters: [],
                requestParameters: {},
                requestTemplates: {},
                integrationHttpMethod: 'POST',
                credentials: credentials,
            };
            if( endpoint.name ) {
                options.uri = 'arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-northeast-1:'+account+':function:'+endpoint.name+'/invocations';
                options.type = 'AWS';
            } else {
                // mock integration
                options.type = 'MOCK';
                options.requestTemplates = {
                    'application/json': '{"statusCode": 200}'
                };
            }
            return apigateway.putIntegration(options, cb);
        },
        function(cb){
            console.log('creating method response: '+endpoint.path+', '+endpoint.method);
            return apigateway.putMethodResponse({
                httpMethod: endpoint.method,
                resourceId: resource.id,
                restApiId: restapi.id,
                statusCode: '200',
                responseModels: {
                    'application/json': null
                },
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': true,
                    'method.response.header.Access-Control-Allow-Methods': true,
                    'method.response.header.Access-Control-Allow-Origin': true
                }
            }, cb);
        },
        function(cb){
            console.log('creating integration response: '+endpoint.path+', '+endpoint.method);
            return apigateway.putIntegrationResponse({
                httpMethod: endpoint.method,
                resourceId: resource.id,
                restApiId: restapi.id,
                statusCode: '200',
                responseTemplates: {
                    'application/json': null
                },
                responseParameters: {
                    'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
                    'method.response.header.Access-Control-Allow-Methods': "'POST,OPTIONS'",
                    'method.response.header.Access-Control-Allow-Origin': "'*'"
                }
            }, cb);
        }
    ], cb);
}

function deleteMethod(endpoint, restapi, resource, cb) {
    console.log('deleting method: '+endpoint.path+', '+endpoint.method);
    return apigateway.deleteMethod({
        httpMethod: endpoint.method,
        resourceId: resource.id,
        restApiId: restapi.id
    }, cb);
}

function deployMethod(endpoint, restapi, resource, cb) {
    if( resource.resourceMethods && resource.resourceMethods[endpoint.method] ) {
        deleteMethod(endpoint, restapi, resource, function(err,data){
            createMethod(endpoint, restapi, resource, cb);
        });
    } else {
        createMethod(endpoint, restapi, resource, cb);
    }
}

function getRestAPI(cb) {
    return apigateway.getRestApis({}, function(err, data) {
        if( err ) return cb(err);
        var apis = data.items.filter(function(api){
            return api.name === apiname;
        });
        if( apis && apis.length === 1 ) {
            // all good, let's go
            return cb(null,apis[0]);
        } else {
            return cb(null,null);
        }
    });
}

exports.deleteAPI = function(cb) {
    return getRestAPI(function(err,data){
        if(err) return cb(err);
        if(data) {
            console.log('deleting rest api: '+apiname);
            return apigateway.deleteRestApi({restApiId: data.id}, cb);
        }
        return cb(null,null);
    });
};

exports.createAPI = function(cb) {
    return getRestAPI(function(err,data){
        if(err) return cb(err);
        if(data) return cb(null,data);

        // need to create...
        console.log('creating rest api: '+apiname);
        return apigateway.createRestApi({name: apiname}, cb);
    });
};

exports.createEndpoint = function(endpoint, cb) {
    var name = endpoint.name,
        path = endpoint.path,
        method = endpoint.method,
        parent = '/',
        leaf = null;

    var components = path.match(/^(.*)\/([^\/]+)$/);
    if( components ) {
        parent = components[1] || '/';
        leaf = components[2];
    }

    return getRestAPI(function(err,restAPI){
        if(err) return cb(err);
        if(!restAPI) return cb('no rest api found');
        return apigateway.getResources({restApiId: restAPI.id}, function(err, data) {
            if(err) return cb(err);

            // process the resources to work out the parentid if needed
            var leafIds = data.items.filter(function(i){return i.path===path;});
            if( !leafIds || !leafIds.length ) { // not found
                var parentId = data.items.filter(function(i){return i.path===parent;})[0].id;
                return apigateway.createResource({
                    parentId: parentId,
                    pathPart: leaf,
                    restApiId: restAPI.id
                }, function(err, data) {
                    if(err) cb(err);
                    return deployMethod(endpoint, restAPI, data, cb);
                });
            } else {
                return deployMethod(endpoint, restAPI, leafIds[0], cb);
            }
        });
    });
};

exports.deployAPI = function(cb) {
    return getRestAPI(function(err,data){
        if(err) return cb(err);
        if(data) {
            console.log('deploying rest api: '+apiname);
            return apigateway.createDeployment({
              restApiId: data.id,
              stageName: 'dev',
              cacheClusterEnabled: false,
              description: 'Automatic developer deployment',
              stageDescription: 'Development stage',
              variables: {}
            }, cb);
        }
        return cb('Rest API not found',null);
    });
};
