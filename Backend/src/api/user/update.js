var user = require('../../user'),
    email = require('../../email'),
    validation = require('../../validation'),
    config = require('../../lambda_configs/config-user-update.json');

exports.handler = function (event, context) {
    //console.log("user update start: ", JSON.stringify(event));

    return user.findUserByEmail(event.email, config.POSTGRES_URL, function (err, userData) {
        if (err) return context.done(null, { error: err });

        if (!userData) return context.done(null, { error: { code: 'notFound' } });
        //console.log("user found: ", JSON.stringify(userData));

        return user.verifyUniqueEmail(event.newEmail, config.POSTGRES_URL,
            function () {
                return context.done(null, { error: { code: 'emailExists', message: 'Email address already registered' } });
            },
            function () {
                if (event.password) {
                    var passwordHash = user.createPasswordHash(event.password, config.CRYPTO_SALT);
                    delete event.password;
                    if (userData.password !== passwordHash) return context.done(null, { error: { code: 'wrongPassword' } });
                } else if (event.auth) {
                    var auth = user.createPasswordHash(userData.userid,  config.CRYPTO_SALT);
                    if (auth !== event.auth) return context.done(null, { error: { code: 'wrongAuth' } });
                    delete event.auth;
                } else {
                    // no auth supplied... return an error
                    return context.done(null, { error: { code: 'wrongPassword' } });
                }

                // Valid!  Lets go!
                if (event.newFirstname) {
                    console.log("firstname updated")
                    userData.firstname = event.newFirstname;
                }
                if (event.newLastname) {
                    console.log("lastname updated")
                    userData.lastname = event.newLastname;
                }

                if (typeof event.enableNotification !== 'undefined') {
                    console.log("enable_notification updated");
                    userData.enableNotification = event.enableNotification;
                }

                if (event.newTocVersion) {
                    console.log("ToC updated")
                    userData.tocVersion = event.newTocVersion;
                }

                if (event.newPassword) {
                    console.log("password updated")
                    var passwordValidation = validation.validatePasswordComplexity(event.newPassword);
                    if (passwordValidation) return context.done(null, { error: passwordValidation }); // error
                    var newPasswordHash = user.createPasswordHash(event.newPassword,  config.CRYPTO_SALT);
                    //delete event.newPassword;
                    userData.password = newPasswordHash;
                }

                if (event.newEmail) {
                    console.log("new email")
                    // generate a validation code for the user
                    var code = user.createValidationCode(event.newEmail, userData.userid, config.CRYPTO_SALT);
                    userData.emailValidationCode = code;
                    userData.emailChangingTo = event.newEmail;
                }

                if (event.newWatchZones) {
                    console.log("watchzones updated");
                    userData.watchZones = event.newWatchZones;
                }

                return user.updateUser(userData, config.POSTGRES_URL, function (err, data) {
                    if (err) return context.done(null, { error: err });
                    if (event.newEmail) {
                        return email.sendVerificationEmail(userData.emailChangingTo, userData.emailValidationCode, config.EMAIL_SOURCE, function (err, data) {
                            if (err) return context.done(null, { error: err });
                            return context.done(null, { result: user.userForResponse(userData,  config.CRYPTO_SALT) });
                        });
                    }

                    if (event.newPassword) {
                        console.log(userData);

                        return email.sendPasswordChangeEmail(userData.email, config.EMAIL_SOURCE, function (err, data) {
                            if (err) return context.done(null, { error: err });
                            return context.done(null, { result: user.userForResponse(userData,  config.CRYPTO_SALT) });
                        });
                    }

                    return context.done(null, { result: user.userForResponse(userData,  config.CRYPTO_SALT) });
                });
            },
           function (err) {
               context.done(null, { error: err })
           }
        );
    });
};
