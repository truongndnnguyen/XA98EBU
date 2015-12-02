var AWS = require('aws-sdk');

AWS.config.update({region:'ap-northeast-1'});
var dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var USER_MODEL_FIELDS = ['userid:S', 'password:S', 'firstname:S', 'lastname:S', 'tocVersion:S', 'email:S', 'emailChangingTo:S',
    'emailValidationCode:S', 'pwresetValidationCode:S', 'watchZones:LWZ'];

// convert the watchzone list returned from dynamo into a normalised model for use in the app
function dynamoWatchZonesToModel(arr) {
    if (arr == null || arr == 'undefined') return null;

    return arr.L.map(function(wz){
        return {
            name: wz.M.name.S,
            radius: wz.M.radius.N,
            latitude: wz.M.latitude.N,
            longitude: wz.M.longitude.N,
            enableNotification: wz.M.enableNotification?wz.M.enableNotification.BOOL:null
        };
    });
}

// convert the watch zone array returned from dynamo into a normalised model for use in the app
function watchZonesModelToDynamo(arr) {
    if (arr == null || arr == undefined || !arr.map) {
        return {};
    };

    return {
        L: arr.map(function(wz){
            return {
                M: {
                    name: {S: wz.name+''},
                    radius: {N: wz.radius+''},
                    latitude: {N: wz.latitude+''},
                    longitude: { N: wz.longitude + '' },
                    enableNotification: { BOOL: wz.enableNotification}
                }
            };
        })
    };
}

// convert the user object returned from dynamo into a normalised model for use in the app
function dynamoUserToModel(item) {
    var userData = {};
    USER_MODEL_FIELDS.forEach(function(key){
        var parse = key.match(/^(.+)\:(.+)$/);
        if( parse ) {
            var fieldName = parse[1], fieldType = parse[2];
            if( fieldType === 'S' ) {
                userData[fieldName] = (item[fieldName] && item[fieldName].S) ? item[fieldName].S : '';
            } else if( fieldType === 'LWZ' ) { // list of watch zones
                userData[fieldName] = dynamoWatchZonesToModel(item[fieldName]);
            }
        }
    });
    return userData;
}

// convert the normalised user model used in the app into a dynamo structure
function userModelToDynamo(userModel) {
    var item = {};
    USER_MODEL_FIELDS.forEach(function(key){
        var parse = key.match(/^(.+)\:(.+)$/);
        if( parse ) {
            var fieldName = parse[1], fieldType = parse[2];
            if( userModel[fieldName] ) {
                if( fieldType === 'S' ) {
                    item[fieldName] = { S: userModel[fieldName] };
                } else if( fieldType === 'LWZ' ) { // list of watch zones
                    item[fieldName] = watchZonesModelToDynamo(userModel[fieldName]);
                }
            }
        }
    });
    return item;
}

function putUserRecord(userModel, cb) {
    return dynamo.putItem({
            TableName: 'em-public-users',
            Item: userModelToDynamo(userModel)
        },
        function (err, data) {
            if (err) return cb(err);
            return cb(null, { result: {} });
        }
    );
}

exports.findUserByKey = function(keyname, keyvalue, cb) {
    return dynamo.query({
        TableName : 'em-public-users',
        IndexName : keyname+'-index',
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames:{
            '#email': keyname
        },
        ExpressionAttributeValues: {
            ':email': {S:keyvalue}
        }
    }, function(err,data){
        if( err ) {
            cb(err);
        }
        if( !data.Items || !data.Items.length ) {
            return cb(null,null);
        }
        return cb(null,dynamoUserToModel(data.Items[0]));
    });
};

exports.deleteUserRecord = function(pvalue, cb) {
    return dynamo.deleteItem({
            TableName: 'em-public-users',
            Key: {userid: {S:pvalue}}
        },
        function (err, data) {
            if (err) return cb(err);
            return cb(null, { result: {} });
        }
    );
};

exports.updateUserRecord = function(userModel, cb) {
    return putUserRecord(userModel, cb);
};

exports.createUserRecord = function(userModel, cb) {
    return putUserRecord(userModel, cb);
};
