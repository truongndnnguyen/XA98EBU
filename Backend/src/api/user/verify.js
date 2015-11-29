var user = require('../../user');

exports.handler = function(event, context) {
    return user.findUserByEmailChangingTo(event.email, function(err,userData){
        if(err) return context.done(null,{error:err});
        if( !userData ) return context.done(null,{error:{code:'notFound'}});

        var code = userData.emailValidationCode;
        if( code !== event.code ) return context.done(null,{error:{code:'invalidCode'}});

        // Valid!  Lets go!
        userData.email = userData.emailChangingTo.toLowerCase();
        delete userData.emailChangingTo;
        delete userData.emailValidationCode;

        return user.updateUser(userData, function(err,data){
            if (err) return context.done(null, { error: err });
            console.log('user to response')
            return context.done(null,{result:user.userForResponse(userData)});
        });
    });
};
