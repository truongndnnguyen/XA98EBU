/*
Send Email Batch
Purpose: to pull an email batch off the queue and send it through ses.

Basic workflow:
1: Check sqs queue
2: Send Email through SES
3: Delete message
4: Check time remaining for function
    -> re-run from step 1
    -> re-execute lambda to reset timer
*/

var AWS = require('aws-sdk'),
    functionConfig = require('../lambda_configs/config-email-deliver.json'),
    sqs = new AWS.SQS(),
    async = require('async'),
    ses = new AWS.SES({region:'us-west-2'}),
    email = require('../email'),
    lambda = new AWS.Lambda({region: 'us-west-2'});
 
exports.handler = function(event, context) {
    console.log("start");
    SendEmailBatch(context);
}

function SendEmailBatch(context)
{
    //var functionConfig = require('../lambda_configs/'+ context.functionName +'.json');

    //console.log('Received event:', JSON.stringify(event, null, 2));
    console.log("###### Start email Batch Request. ######");

    var params = {
        QueueUrl: functionConfig.SQSURL, /* required */
        AttributeNames: [
        'All'
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: [
        'All'
        ],
        VisibilityTimeout: 30,
        WaitTimeSeconds: 5
    };

    sqs.receiveMessage(params, function(err, data) {    
        if (err) 
            console.log(err, err.stack); // an error occurred
        else {    
            if(typeof data.Messages === 'undefined') {
                    console.log("No Message found close Lambda.")
                    return context.done(null,"finished")
            }
            console.log("RECEIVED MESSAGE RESPONSE")
            //console.log("Queue: ", JSON.stringify(data.Messages[0].Body)); 
            //console.log("messageBody: ", messageBody);         
            //console.log(data.Messages);
            //console.log("Message Count: ", data.Messages.length);
            
            var messageBody = JSON.parse(data.Messages[0].Body);
            var messageReceiptHandle = data.Messages[0].ReceiptHandle;

            var asyncTasks = [];
            var emailList = [];

            console.log("## emails to send ##")
            messageBody.recipients.forEach(function(recipient){
                console.log("email: ", recipient.emailaddr)
                emailList.push({ email: recipient.emailaddr, wz: recipient.watchzone, name: recipient.firstname + ' ' + recipient.lastname });
            })

            async.each(emailList,
                function(individualEmail, callback) {
                    //console.log("email: ", individualEmail);
                    //(email, name, alertBody, callback)
                    email.sendWzEmail(individualEmail.email, individualEmail.name, individualEmail.wz, messageBody.event.webBody, functionConfig.EMAIL_SOURCE, callback);
                },
                function(err) {
                    if(err) {
                        console.log("####### ERROR sending emails #########")
                        console.log("ERROR: ", err);
                        if( context.getRemainingTimeInMillis() > 20000 ) {
                            console.log("re-run queue loop");
                            SendEmailBatch(context);
                        }
                        else {
                            console.log("re-execute lambda to reset timer")
                            lambda.invoke({
                                        FunctionName: context.functionName,
                                        InvocationType: 'Event',
                                        Payload: null,
                                    }, function(err, data){
                                    return context.done(err, "finished ")
                                });
                        }
                    }
                    else {
                        console.log("sent emails")
                        var deleteparams = {
                            QueueUrl: functionConfig.SQSURL,
                            ReceiptHandle: messageReceiptHandle
                        };

                        console.log("ABOUT TO DELETE MESSAGE")
                        //console.log("delete: ", deleteparams)

                        sqs.deleteMessage(deleteparams, function(err, data) {
                            console.log("Message Delete")
                            if (err) 
                                console.log("ERROR Deleting Queue item: ", err); // an error occurred

                            if(context.getRemainingTimeInMillis() > 20000 ) {
                                //continue running internal lambda loop.
                                console.log(context.getRemainingTimeInMillis().toString(), 'remaining, re-run queue loop');
                                SendEmailBatch(context);
                            }
                            else {
                                //close lambda and re-execute to reset time.
                                console.log(context.getRemainingTimeInMillis().toString(), 'remaining, finish execution loop');

                                lambda.invoke({
                                        FunctionName: context.functionName,
                                        InvocationType: 'Event',
                                        Payload: null,
                                    }, function(err, data){
                                    return context.done(err, "finished")
                                });
                            }
                        });
                    }   
                }
            );
        }        
    });
};