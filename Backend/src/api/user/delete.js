var user = require('../../user');

exports.handler = function(event, context) {
    return user.findUserByEmail( event.email, function (err, userData) {
        if (err) return context.done(null, { error: err });
        if (!userData) return context.done(null, { error: { code: 'notFound' } });

        auth = user.createPasswordHash(userData.userid);
        if( auth !== event.auth ) return context.done(null,{error:{code:'wrongAuth'}});

        return user.deleteUser(userData.userid, function (err, data) {
            if (err) return context.done(null, { error: err });
            return context.done(null, { result: {} });
        });
    });
};
