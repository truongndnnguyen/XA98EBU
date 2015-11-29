var user = require('../../user'),
    email = require('../../email'),
    validation = require('../../validation');

exports.handler = function (event, context) {
    return user.findUserByEmail(event.email, function (err, userData) {
        if (err) return context.done(null, { error: err });
        if (!userData) return context.done(null, { error: { code: 'notFound' } });

        return user.verifyUniqueEmail(event.newEmail,
            function () {
                return context.done(null, { error: { code: 'emailExists', message: 'Email address already registered' } });
            },
            function () {
                if (event.password) {
                    var passwordHash = user.createPasswordHash(event.password);
                    delete event.password;
                    if (userData.password !== passwordHash) return context.done(null, { error: { code: 'wrongPassword' } });
                } else if (event.auth) {
                    var auth = user.createPasswordHash(userData.userid);
                    if (auth !== event.auth) return context.done(null, { error: { code: 'wrongAuth' } });
                    delete event.auth;
                } else {
                    // no auth supplied... return an error
                    return context.done(null, { error: { code: 'wrongPassword' } });
                }

                // Valid!  Lets go!
                if (event.newFirstname) {
                    userData.firstname = event.newFirstname;
                }
                if (event.newLastname) {
                    userData.lastname = event.newLastname;
                }

                if (event.newTocVersion) {
                    userData.tocVersion = event.newTocVersion;
                }

                if (event.newPassword) {
                    var passwordValidation = validation.validatePasswordComplexity(event.newPassword);
                    if (passwordValidation) return context.done(null, { error: passwordValidation }); // error
                    var newPasswordHash = user.createPasswordHash(event.newPassword);
                    //delete event.newPassword;
                    userData.password = newPasswordHash;
                }

                if (event.newEmail) {
                    // generate a validation code for the user
                    var code = user.createValidationCode(event.newEmail, userData.userid);
                    userData.emailValidationCode = code;
                    userData.emailChangingTo = event.newEmail;
                }

                if (event.newWatchZones) {
                    userData.watchZones = event.newWatchZones;
                }

                return user.updateUser(userData, function (err, data) {
                    if (err) return context.done(null, { error: err });
                    if (event.newEmail) {
                        return email.sendVerificationEmail(userData.emailChangingTo, userData.emailValidationCode, function (err, data) {
                            if (err) return context.done(null, { error: err });
                            return context.done(null, { result: user.userForResponse(userData) });
                        });
                    }

                    if (event.newPassword) {
                        console.log(userData);

                        return email.sendPasswordChangeEmail(userData.email, function (err, data) {
                            if (err) return context.done(null, { error: err });
                            return context.done(null, { result: user.userForResponse(userData) });
                        });
                    }

                    return context.done(null, { result: user.userForResponse(userData) });
                });
            },
           function (err) {
               context.done(null, { error: err })
           }
        );
    });
};
