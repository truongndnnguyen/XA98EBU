var AWS = require('aws-sdk'),
    user = require('../user'),
    config = require('../lambda_configs/config-ses-bounce-processor.json'),
    async = require('async');

exports.handler = function(event, context) {
    console.log("##### SNS BOUNCE #####");
    console.log(JSON.stringify(event));

    event.Records.forEach(function(record){
    	console.log("record: ", record);
    	var message = JSON.parse(record.Sns.Message);
    	
    	async.each(message.bounce.bouncedRecipients,
    		function(bouncedEmail, callback) {
                console.log("user to disable: ", bouncedEmail)
    			user.disableEmailsForUser(bouncedEmail.emailAddress, config.CRYPTO_SALT, config.POSTGRES_URL, callback);
    		},
    		function(err, result) {
    			console.log("err: ", err);
    			console.log("results: ", result);
    			console.log("users updated");
    			context.done(err, "finished");
    		})
    })  
}