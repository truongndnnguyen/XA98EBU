var user = require('../../user');

exports.handler = function (event, context) {
    console.log(event)
    return user.findUserByEmail( event.email, function(err,userData){
        if(err) return context.done(null,{error:err});
        if( ! userData ) return context.done(null,{error:{code:'notFound'}});

        if (event.password) {
            // authenticate by password
            var passwordHash = user.createPasswordHash(event.password);
            delete event.password;
            if (userData.password !== passwordHash) return context.done(null, { error: { code: 'wrongPassword' } });
            return context.done(null, {result:user.userForResponse(userData)});
        } else if( event.token ) {
            // authenticate by single-use token (password reset)
            if( userData.pwresetValidationCode !== event.token ) {
                return context.done(null,{error:{code:'wrongToken'}});
            }

            delete userData.pwresetValidationCode;

            return user.updateUser(userData, function(err,data){
                if( err ) return context.done(null,{error:err});
                return context.done(null, {result:user.userForResponse(userData)});
            });
        } else if (event.auth && event.auth === user.createPasswordHash(userData.userid)) {
            //user auth to detect user already login
            return context.done(null, {result:user.userForResponse(userData)});
        } else {
            // unable to authenticate user
            return context.done(null,{error:{code:'wrongPassword'}});
        }
    });
};
