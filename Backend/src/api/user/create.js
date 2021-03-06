var user = require('../../user'),
    email = require('../../email'),
    config = require('../../lambda_configs/config-user-create.json'),
    validation = require('../../validation');

exports.handler = function (event, context) {
    //that currently is sent from front-end, need to find a better way 
    var appURL = event.rootUrl;

    return user.findUserByEmail( event.email, config.POSTGRES_URL, function(err,userData2){
        if(err) return context.done(null,{error:err});
        if(userData2) { // found a result
            return context.done(null,{error:{code:'emailExists',message:'Email address already registered'}});
        }
        return user.findUserByEmailChangingTo(event.email, config.POSTGRES_URL, function(err,userData){
            if(err) return context.done(null,{error:err});
            if(userData) {// found a result
                return context.done(null, { error: { code: 'emailExists', message: 'Email address already registered' } });
                // Good practice is to send a new validation email... but disable for the moment
                // return email.sendVerificationEmail(userData.emailChangingTo, userData.emailValidationCode, function(err,data){
                //     if( err ) return context.done(null,{error:err});
                //     return context.done(null, {result:data.result});
                // });
            }

            var passwordValidation = validation.validatePasswordComplexity(event.password);
            if( passwordValidation ) {
                return context.done(null, {error:passwordValidation}); // error
            }

            userData = {
                userid: event.userid,
                emailChangingTo: event.email,
                emailValidationCode: user.createValidationCode(event.email, event.password, config.CRYPTO_SALT),
                tocVersion: event.tocVersion,
                firstname: event.firstname,
                lastname: event.lastname,
                password: user.createPasswordHash(event.password, config.CRYPTO_SALT),
                updated: new Date().toISOString()
            };

            return user.createUser(userData, config.POSTGRES_URL, function(err,data){
                if( err ) return context.done(null,{error:err});
                return email.sendVerificationEmail(event.email, data.code, config.EMAIL_SOURCE, config.VERIFICATION_URL, function(err,data){
                    if( err ) return context.done(null,{error:rr});
                    return context.done(null, { result: {}});
                });
            });
        });
    });
};
