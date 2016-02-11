var AWS = require('aws-sdk'),
    ses = new AWS.SES({region:'us-west-2'}),
    handlebars = require('handlebars'),
    fs = require('fs');

var emailVerifySubject = require('./templates/email.verify.subject'),
    emailVerifyBody = require('./templates/email.verify.body'),
    emailPasswordResetSubject = require('./templates/email.pwreset.subject'),
    emailPasswordResetBody = require('./templates/email.pwreset.body'),
    emailPasswordChangeSubject = require('./templates/email.pwchange.subject'),
    emailPasswordChangeBody = require('./templates/email.pwchange.body'),
    emailwzAlertSubject = require('./templates/email.wzAlert.subject'),
    emailwzAlertBody = require('./templates/email.wzAlert.body');

function sendEmail(email, subject, body, emailSource, cb) {
    ses.sendEmail({
        Source: emailSource,
        Destination: {
            ToAddresses: [ email ]
        },
        Message: {
            Subject: { Data: subject },
            Body: {
                Html: {
                    Data: body
                }
            }
        }
    }, cb);
}

exports.sendVerificationEmail = function (email, token, emailSource, verificationPage, cb) {
    var subject = emailVerifySubject();
    var verificationLink = verificationPage + '&email=' + encodeURIComponent(email) + '&token=' + token;
    var body = emailVerifyBody({
        subject: subject,
        verificationLink: verificationLink
    });
    sendEmail(email, subject, body, emailSource, cb);
};

exports.sendPWResetVerificationEmail = function(email, token, emailSource, passwordResetPage, cb) {
    var subject = emailPasswordResetSubject();
    var verificationLink = passwordResetPage + '&email=' + encodeURIComponent(email) + '&token=' + token;
    var body = emailPasswordResetBody({
        subject: subject,
        verificationLink: verificationLink
    });
    sendEmail(email, subject, body, emailSource, cb);
};
exports.sendPasswordChangeEmail = function(email, emailSource, cb) {
    var subject = emailPasswordChangeSubject();
    var body = emailPasswordChangeBody();
    sendEmail(email, subject, body, emailSource, cb);
};


exports.sendWzEmail = function(email, name, watchzone, alertBody, emailSource, callback) {
    var subject = emailwzAlertSubject();

    var body = emailwzAlertBody({
            subject: subject,
            name: name,
            watchzone: watchzone,
            alertBody: alertBody
        });

    sendEmail(email, subject, body, emailSource, callback);
}