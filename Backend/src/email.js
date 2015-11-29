var AWS = require('aws-sdk'),
    ses = new AWS.SES({region:'us-west-2'}),
    handlebars = require('handlebars'),
    fs = require('fs');

var EMAIL_SOURCE = 'no-reply@devcop.em.vic.gov.au',
    EXTERNAL_NAME = 'Emergency Management Victoria',
    VERIFICATION_PAGE = '/about-this-site/profile.html?op=verify',
    PASSWORD_RESET_PAGE = '/about-this-site/profile.html?op=pwreset';

var emailVerifySubject = require('./templates/email.verify.subject'),
    emailVerifyBody = require('./templates/email.verify.body'),
    emailPasswordResetSubject = require('./templates/email.pwreset.subject'),
    emailPasswordResetBody = require('./templates/email.pwreset.body'),
    emailPasswordChangeSubject = require('./templates/email.pwchange.subject'),
    emailPasswordChangeBody = require('./templates/email.pwchange.body');

function sendEmail(email, subject, body, cb) {
    ses.sendEmail({
        Source: EMAIL_SOURCE,
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

exports.sendVerificationEmail = function (email, token, cb) {
    var frontEndRootURL = global.emvrequest.requestUrl;
    var subject = emailVerifySubject();
    var verificationLink =VERIFICATION_PAGE + '&email=' + encodeURIComponent(email) + '&token=' + token;
    var body = emailVerifyBody({
        subject: subject,
        verificationLink: verificationLink,
        rootUrl: frontEndRootURL
    });
    sendEmail(email, subject, body, cb);
};

exports.sendPWResetVerificationEmail = function (email, token, cb) {
    var frontEndRootURL = global.emvrequest.requestUrl;
    var subject = emailPasswordResetSubject();
    var verificationLink = PASSWORD_RESET_PAGE + '&email=' + encodeURIComponent(email) + '&token=' + token;
    var body = emailPasswordResetBody({
        subject: subject,
        verificationLink: verificationLink,
        rootUrl: frontEndRootURL
    });
    sendEmail(email, subject, body, cb);
};
exports.sendPasswordChangeEmail = function(email, cb) {
    var subject = emailPasswordChangeSubject();
    var body = emailPasswordChangeBody({
        rootUrl: global.emvrequest.requestUrl
    });
    sendEmail(email, subject, body, cb);
};

