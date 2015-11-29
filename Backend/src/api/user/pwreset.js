var user = require('../../user'),
    email = require('../../email');

exports.handler = function(event, context) {
    return user.findUserByEmail( event.email, function(err,userData){
        if(err) return context.done(null,{error:err});
        if(!userData) {// no results
            return context.done(null,{error:{code:'notFound',message:'Email address not found'}});
        }

        // generate a validation code for the user
        var code = user.createValidationCode(event.newEmail, userData.userid);
        userData.pwresetValidationCode = code;

        return user.updateUser(userData, function(err,data){
            if( err ) return context.done(null,{error:err});
            return email.sendPWResetVerificationEmail(userData.email, userData.pwresetValidationCode, function(err,data){
                if( err ) return context.done(null,{error:err});
                return context.done(null, { result: {}});
            });
        });
    });
};
