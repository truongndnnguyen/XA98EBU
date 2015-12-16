var AWS = require('aws-sdk'),
    async = require('async');
var db = require('../postgresql');

AWS.config.update({region:'ap-northeast-1'});
var dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var BATCH_SIZE = 1000;

function batches(arr) {
    var ret = [];
    while(arr.length > 0) {
        var max = BATCH_SIZE > arr.length ? arr.length : BATCH_SIZE;
        ret.push(arr.slice(0,max));
        arr = arr.slice(max);
    }
    return ret;
}

function objToDynamo(obj) {
    if( obj === null ) {
        return null;
    } else if( Array.isArray(obj) ) {
        return {
            L: obj.map(objToDynamo)
        };
    } else if( typeof obj === 'object' ) {
        var ret = {};
        for(var key in obj) {
            val = objToDynamo(obj[key]);
            if( val !== null ) {
                ret[key] = val;
            }
        }
        return {M: ret};
    } else if( typeof obj === 'string' ) {
        return {S: obj};
    } else {
        return {S: ''+obj};
    }
}

exports.handler = function(event, context) {
    var message = event.Records[0].Sns.Message;
    if( typeof message === 'string' ) {
        message = JSON.parse(message);
    }

    var messageId = [message.properties.category1||'unknown', message.properties.category2||'unknown',
        message.properties.id||'unknown', message.properties.created||'unknown'].join('/');

    return db.notifyableUsers(message.geometry, message.properties, function(err,data) {
        if(err) {
            return context.done(err);
        }
        var event = objToDynamo(message.properties);
        var batchNum = 0;
        async.each(batches(data.rows).map(function(batch){
            return {
                batchId: {S: messageId+'/'+(batchNum++)},
                created: {S: new Date().toISOString()},
                event: event,
                recipients: {
                    L: batch.map(function(rec){
                        return { M: { emailaddr: {S: ''+(rec.email||rec.userid)},
                                 watchzone: { S: rec.name}
                               }};
                    })
                }
            };
        }), function(batch, cb){
            dynamo.putItem({
                TableName: 'em-public-batch-email',
                Item: batch
            }, cb);
        }, function(err,results){
            if( err ) {
                // failed to batch something
                console.log('ERROR: Caught error in parallel processing:', err);
                return context.done(err);
            }
            console.log('SUCCESS: Completed matching, found '+data.rows.length+' matches');
            return context.done(null, 'Finished matching, found '+data.rows.length+' matches');
        });
    });
};
