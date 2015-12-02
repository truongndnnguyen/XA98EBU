var AWS = require('aws-sdk'),
    async = require('async'),
    path = require('path');

/* Globals */
var esDomain = {
    endpoint: 'search-em-public-users-ci-76jkbnr2qvmb5iktdt2hpfh54q.ap-southeast-2.es.amazonaws.com',
    region: 'ap-southeast-2',
    index: 'users',
    doctype: 'dynamodb'
};
var endpoint =  new AWS.Endpoint(esDomain.endpoint);

/*
 * The AWS credentials are picked up from the environment.
 * They belong to the IAM role assigned to the Lambda function.
 * Since the ES requests are signed using these credentials,
 * make sure to apply a policy that permits ES domain operations
 * to the role.
 */
var creds = new AWS.EnvironmentCredentials('AWS');
console.log('creds: %j',creds);

/* Lambda "main": Execution starts here */
exports.handler = function(event, context) {
    var posts = event.Records.map(function(record) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
        return record.dynamodb;
    });
    async.map(posts, dynamoToES, context.done);
};

function dynamoToES(data, cb) {
    var req = new AWS.HttpRequest(endpoint);

    req.method = 'POST';
    req.path = path.join('/', esDomain.index, esDomain.doctype);
    req.region = esDomain.region;
    req.body = JSON.stringify(data);
    req.headers['presigned-expires'] = false;
    req.headers['Host'] = endpoint.host;

    // Sign the request (Sigv4)
    var signer = new AWS.Signers.V4(req, 'es');
    signer.addAuthorization(creds, new Date());

    // Post document to ES
    var send = new AWS.NodeHttpClient();
    send.handleRequest(req, null, function(httpResp) {
        var body = '';
        httpResp.on('data', function (chunk) {
            body += chunk;
        });
        httpResp.on('end', function (chunk) {
            cb(null, body);
        });
    }, function(err) {
        cb(err);
    });
}
