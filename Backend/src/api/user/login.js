var emailer = require('../../email'),
    config = require('../../lambda_configs/config-user-login.json'),
    user = require('../../user');

exports.handler = function (event, context) {
    //resend activation email
    if (event.resendEmail) {
        return user.findUserByEmailChangingTo(event.email, config.POSTGRES_URL,
            function (err, data) {
                if (err) {
                    return callback(err, { error: { code: 'err' } });
                }
                if (data) {
                    var code = user.createValidationCode(event.email, data.password, config.CRYPTO_SALT);
                    data.emailValidationCode = code;
                    return user.updateUser(data, config.POSTGRES_URL, function (err, data) {
                        return emailer.sendVerificationEmail(event.email, code, config.EMAIL_SOURCE, config.VERIFICATION_URL,function (err, data) {
                            if (err) return context.done(null, { error: err });
                            return context.done(null, { result: {} });
                        });
                        return context.done(null, { result: {} });
                    });
                }
                else {
                    return callback({ error: { code: 'notFound' } });
                }
            });
    }
    else
        return user.findUserByEmail(event.email, config.POSTGRES_URL,function (err, userData) {
            if (err) return context.done(null, { error: err });
            if (!userData) {
                return user.findUserByEmailChangingTo(event.email, config.POSTGRES_URL, function (err, data) {
                    if (data && (data.email == null || data.email === '')) {
                        return context.done(null, { error: { code: 'notVerified' } });
                    } else
                        return context.done(null, { error: { code: 'notFound' } });
                })
            }
            if (event.password) {
                // authenticate by password
                var passwordHash = user.createPasswordHash(event.password, config.CRYPTO_SALT);
                delete event.password;
                if (userData.password !== passwordHash) return context.done(null, { error: { code: 'wrongPassword' } });
                return context.done(null, { result: user.userForResponse(userData, config.CRYPTO_SALT) });
            } else if (event.token) {
                // authenticate by single-use token (password reset)
                if (userData.pwresetValidationCode !== event.token) {
                    return context.done(null, { error: { code: 'wrongToken' } });
                }

                delete userData.pwresetValidationCode;

                return user.updateUser(userData, config.POSTGRES_URL, function (err, data) {
                    if (err) return context.done(null, { error: err });
                    return context.done(null, { result: user.userForResponse(userData, config.CRYPTO_SALT) });
                });
            } else if (event.auth && event.auth === user.createPasswordHash(userData.userid, config.CRYPTO_SALT)) {
                //user auth to detect user already login
                return context.done(null, { result: user.userForResponse(userData, config.CRYPTO_SALT) });
            } else {
                // unable to authenticate user
                return context.done(null, { error: { code: 'wrongPassword' } });
            }
        });
};
