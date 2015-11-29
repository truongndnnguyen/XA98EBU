var uuid = require('uuid'),
    crypto = require('crypto'),
    validation = require('./validation'),
    dynamo = require('./dynamo');

// generic functions here

var USER_MODEL_FOR_RESPONSE_FIELDS = ['firstname', 'lastname', 'tocVersion', 'email', 'emailChangingTo', 'watchZones'];
var SALT = 'This is the salt that is used for the crypto key.  This secret is used to ensure externals cannot guess the hash';

exports.createPasswordHash = function(password) {
    return crypto.createHash('sha1').update(password+SALT).digest('hex');
};

exports.createValidationCode = function(email, password) {
    return crypto.createHash('sha1').update(uuid.v4()+email+password+SALT).digest('hex');
};

// convert the normalised user object used in the app into a sanitised model for return from the API
exports.userForResponse = function(item) {
    var userData = {};
    userData.auth = exports.createPasswordHash(item.userid);
    USER_MODEL_FOR_RESPONSE_FIELDS.forEach(function(key){
        userData[key] = item[key] ? item[key] : '';
    });
    return userData;
};

// standardised interface functions

exports.findUserByEmail = function (email, cb) {
    return dynamo.findUserByKey('email',email.toLowerCase(),cb);
};

exports.findUserByEmailChangingTo = function(email, cb) {
    return dynamo.findUserByKey('emailChangingTo', email.toLowerCase(), cb);
};

exports.deleteUser = function (userid, cb) {
    return dynamo.deleteUserRecord(userid, cb);
};

exports.updateUser = function(userModel, cb) {
    userModel.updated = new Date().toISOString();
    return dynamo.putUserRecord(userModel, cb);
};

exports.createUser = function(userModel, cb) {
    userModel.userid = uuid.v4();
    userModel.updated = new Date().toISOString();
    userModel.emailChangingTo = userModel.emailChangingTo.toLowerCase();
    return dynamo.putUserRecord(userModel, function (err, data) {
        if (err) return cb(err);
        return cb(null, {result:userModel, code:userModel.emailValidationCode});
    });
};

exports.verifyUniqueEmail = function (email, found, notFound, error) {
    if (email === '' || email == null || email == undefined) {
        return notFound();
    }
    return dynamo.findUserByKey('email', email.toLowerCase(), function (err, data) {
        if (err) return error(err)
        if (data) {
            return found(data);
        }
        return dynamo.findUserByKey('emailChangingTo', email.toLowerCase(), function (err, data) {
            if (err) return error(err)
            if (data) {
                return found(data)
            }
            return notFound()
        });
    });
}
