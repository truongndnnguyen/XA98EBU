var AWS = require('aws-sdk'),
    async = require('async'),
    sqs = new AWS.SQS(),
    functionConfig = require('../lambda_configs/config-email-scaler.json'),
    lambda = new AWS.Lambda({region: 'us-west-2'});

exports.handler = function(event, context) {

   // var functionConfig = require('../lambda_configs/'+ context.functionName +'.json');

    var params = {
        QueueUrl: functionConfig.SQSURL,
        AttributeNames: ['All']
    };
    sqs.getQueueAttributes(params, function(err, data) {
        /*
        if(data.Attributes) {
            console.log("##### Attributes ####")
            console.log("Not Visible: ", data.Attributes.ApproximateNumberOfMessagesNotVisible)
            console.log("Approx Messages: ", data.Attributes.ApproximateNumberOfMessages );
        }
        */

        if(((data.Attributes.ApproximateNumberOfMessagesNotVisible-0) < 10) && ((data.Attributes.ApproximateNumberOfMessages-0) > 0)) {
            console.log("starting delivery");

            var asyncLambda = [];
            var emailFunctionName = functionConfig.LAMBDA_EMAIL_DELIVER
            var deliverFunctionCount = functionConfig.DELIVER_FUNCTION_COUNT || 10;
            console.log("Calling ", deliverFunctionCount, " instances of ", emailFunctionName)

            for( i=0;  i < deliverFunctionCount; i++) {
                asyncLambda.push(function(callback) {
                    lambda.invoke({
                            FunctionName: emailFunctionName,
                            InvocationType: 'Event',
                            Payload: null,
                        }, callback);
                });
            }
            console.log("Calling email deliver functions")

            async.parallel(asyncLambda, function(err, result) {
                if(err) {
                    return context.done(err);
                }
                return context.done(null, "email deliver functions launched");
            });
    
        } else {
            console.log("Email Postman jobs already running");
            return context.done(null, "Email Postman jobs already running");
        }

        //return context.done(null, "No emails to deliver");
    });



}