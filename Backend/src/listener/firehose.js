var AWS = require('aws-sdk'),
    async = require('async'),
    functionConfig = require('../lambda_configs/config-firehose.json'),
    db = require('../postgresql');

AWS.config.update({region:'ap-northeast-1'});
var sqs = new AWS.SQS({region:'us-west-2'}); 
var uswestlambda = new AWS.Lambda({region: 'us-west-2'});


exports.handler = function(event, context) {
    var message = event.Records[0].Sns.Message;
    //var functionConfig = require('../lambda_configs/'+ context.functionName +'.json');

    console.log("lambda config: ", functionConfig.LAMBDA_EMAIL_SCALER);
    console.log("BatchSize config: ", functionConfig.BATCH_SIZE);
    console.log("Sqs queue: ", functionConfig.SQSURL);

    if( typeof message === 'string' ) {
        message = JSON.parse(message);
    }

    var messageId = message.properties.id ||'unknown';

    var classification = getClassification(message.properties.feedType, message.properties.category1, message.properties.category2);
    console.log("warning classification: ", classification);

    if(!classification)
        return context.done(null, "not a warning");

    return db.notifyableUsers(message.geometry, message.properties, classification, functionConfig.POSTGRES_URL, function(err,data) {
        if(err) {
            return context.done(err);
        }
        //var event = objToDynamo(message.properties);
        
        console.log("##### FETCH POSTGRES DATA ####");
        //console.log(data);
        console.log('SUCCESS: Completed matching, found '+data.rows.length+' matches');

        var batchNum = 0;

        var batchJobs = batches(data.rows,  functionConfig.BATCH_SIZE).map(function(batch) {
            return {
                batchId: messageId+'/'+(batchNum++),
                created: new Date().toISOString(),
                event: message.properties,
                recipients: 
                    batch.map(function(rec){
                        return { 
                            emailaddr: ''+ (rec.email||rec.userid),
                            watchzone: rec.name,
                            firstname: rec.firstname,
                            lastname: rec.lastname
                         };
                    })
            };
        });

        console.log("##### Load matches to SQS #####");

        async.each(batchJobs, function(batch, cb) {       

            var params = {
              MessageBody: JSON.stringify(batch), /* required */
              QueueUrl: functionConfig.SQSURL, /* required */
              DelaySeconds: 0
            };

            sqs.sendMessage(params, cb);

        }, function(err,results) {
            if( err ) {
                // failed to batch something
                console.log('ERROR: Caught error in parallel processing:', err);
                return context.done(err);
            }
            console.log("#### successful send #####")

            var asyncLambda = []
            if(functionConfig.ENABLE_EMAILS) {
                console.log("Calling ", functionConfig.LAMBDA_EMAIL_SCALER);
                uswestlambda.invoke({
                        FunctionName: functionConfig.LAMBDA_EMAIL_SCALER,
                        InvocationType: 'Event',
                        Payload: null,
                    }, function(err, result) {
                    return context.done(err, "finished and sent sqs, started email processor.");
                }) 
            } 
            else {
                 return context.done(err, "finished and sent sqs, email processor not started.");
            }  
        });
    });
};



function getClassification(feedType, category1, category2)
{
    if(feedType != "warning")
        return null;

    if(category1.indexOf("Evacuate") >= 0)
        return "evacuate";

    var cat1and2 = (category1+category2).replace(/\s+/g, '').toLowerCase(); 
    var cat1 =  (category1).replace(/\s+/g, '').toLowerCase();

    var energencyWarning = ['emergencywarning','landtsunami', 'marinetsunami'];
    var watchAndAct = ['watchandact', 'major', 'major(downgradefrompeak)', 'moderate', 'moderate(downgradefrommajor)','moderatetomajor','minortomoderate'];
    var communityUpdate = ['communityupdate'];

    if(energencyWarning.indexOf(cat1) >= 0 || energencyWarning.indexOf(cat1and2) >= 0 )
        return 'emergencywarning'; 

    if(watchAndAct.indexOf(cat1) >= 0 || watchAndAct.indexOf(cat1and2) >= 0 )
        return 'watchandact';

    if(communityUpdate.indexOf(cat1) >= 0)
        return 'communityupdate';

    return "advice";
}

function batches(arr, batch_size) {
    var ret = [];
    while(arr.length > 0) {
        var max = batch_size > arr.length ? arr.length : batch_size;
        ret.push(arr.slice(0,max));
        arr = arr.slice(max);
    }
    return ret;
}
