var user = require('../../user'),
    config = require('../../lambda_configs/config-user-delete.json');

exports.handler = function(event, context) {
    return user.findUserByEmail( event.email, config.POSTGRES_URL, function (err, userData) {
        if (err) return context.done(null, { error: err });
        if (!userData) return context.done(null, { error: { code: 'notFound' } });

        auth = user.createPasswordHash(userData.userid, config.CRYPTO_SALT);
        if( auth !== event.auth ) return context.done(null,{error:{code:'wrongAuth'}});

        return user.deleteUser(userData.userid, config.POSTGRES_URL, function (err, data) {
            if (err) return context.done(null, { error: err });
            return context.done(null, { result: {} });
        });
    });
};
