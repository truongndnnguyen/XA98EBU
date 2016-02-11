var AWS = require('aws-sdk'),
    fs = require('fs');

var ACCOUNT = '644368612228';

exports.deploy = function(subscription, cb) {
    var topic = 'arn:aws:sns:'+subscription.region+':'+ACCOUNT+':'+subscription.topic;
    var endpoint = 'arn:aws:lambda:'+subscription.region+':'+ACCOUNT+':function:'+subscription.name;

    var sns = new AWS.SNS({region: subscription.region});

    return sns.subscribe({
        Protocol: 'lambda', /* required */
        TopicArn: topic, /* required */
        Endpoint: endpoint
    }, function(err,data){
        if(err) cb(err);
        cb();
    });
};