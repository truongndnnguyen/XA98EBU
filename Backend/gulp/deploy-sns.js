var AWS = require('aws-sdk'),
    sns = new AWS.SNS(),
    fs = require('fs');

var REGION = 'ap-northeast-1',
    ACCOUNT = '644368612228';

exports.deploy = function(subscription, cb) {
    return sns.subscribe({
        Protocol: 'lambda', /* required */
        TopicArn: 'arn:aws:sns:'+REGION+':'+ACCOUNT+':'+subscription.topic, /* required */
        Endpoint: 'arn:aws:lambda:'+REGION+':'+ACCOUNT+':function:'+subscription.name
    }, function(err,data){
        if(err) cb(err);
        cb();
    });
};
