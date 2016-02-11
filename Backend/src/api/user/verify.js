var user = require('../../user'),
    config = require('../../lambda_configs/config-user-verify.json');

exports.handler = function(event, context) {
    return user.findUserByEmailChangingTo(event.email, config.POSTGRES_URL, function(err,userData){
        if(err) return context.done(null,{error:err});
        if( !userData ) return context.done(null,{error:{code:'notFound'}});

        var code = userData.emailValidationCode;
        if( code !== event.code ) return context.done(null,{error:{code:'invalidCode'}});

        // Valid!  Lets go!
        userData.email = userData.emailChangingTo.toLowerCase();
        userData.enableNotification = true;
        
        delete userData.emailChangingTo;
        delete userData.emailValidationCode;

        return user.updateUser(userData, config.POSTGRES_URL, function(err,data){
            if (err) return context.done(null, { error: err });
            console.log('user to response')
            return context.done(null,{result:user.userForResponse(userData, config.CRYPTO_SALT)});
        });
    });
};
