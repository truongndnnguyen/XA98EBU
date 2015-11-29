var user = require('../../user'),
    email = require('../../email'),
    validation = require('../../validation');

exports.handler = function(event, context) {
    return user.findUserByEmail( event.email, function(err,userData2){
        if(err) return context.done(null,{error:err});
        if(userData2) { // found a result
            return context.done(null,{error:{code:'emailExists',message:'Email address already registered'}});
        }
        return user.findUserByEmailChangingTo(event.email, function(err,userData){
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
                emailValidationCode: user.createValidationCode(event.email, event.password),
                tocVersion: event.tocVersion,
                firstname: event.firstname,
                lastname: event.lastname,
                password: user.createPasswordHash(event.password),
                updated: new Date().toISOString()
            };

            return user.createUser(userData, function(err,data){
                if (err) return context.done(null, { error: err });
                return email.sendVerificationEmail(data.result.emailChangingTo, data.code, function (err, data) {
                    if( err ) return context.done(null,{error:err});
                    return context.done(null, { result: {}});
                });
            });
        });
    });
};
