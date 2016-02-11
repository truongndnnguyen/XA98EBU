var user = require('../../user'),
    config = require('../../lambda_configs/config-user-pwreset.json'),
    email = require('../../email');

exports.handler = function(event, context) {
    return user.findUserByEmail( event.email, config.POSTGRES_URL, function(err,userData){
        if(err) return context.done(null,{error:err});
        if(!userData) {// no results
            return context.done(null,{error:{code:'notFound',message:'Email address not found'}});
        }

        // generate a validation code for the user
        var code = user.createValidationCode(event.newEmail, userData.userid, config.CRYPTO_SALT);
        userData.pwresetValidationCode = code;

        return user.updateUser(userData, config.POSTGRES_URL, function(err,data){
            if( err ) return context.done(null,{error:err});
            return email.sendPWResetVerificationEmail(userData.email, userData.pwresetValidationCode, config.EMAIL_SOURCE, config.PASSWORD_RESET_URL, function(err,data){
                if( err ) return context.done(null,{error:err});
                return context.done(null, { result: {}});
            });
        });
    });
};
