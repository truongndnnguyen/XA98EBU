var uuid = require('uuid'),
    crypto = require('crypto'),
    validation = require('./validation'),
    db = require('./postgresql'),
    config = require('./config.json');

// generic functions here

var USER_MODEL_FOR_RESPONSE_FIELDS = ['firstname', 'lastname', 'tocVersion', 'email', 'emailChangingTo', 'enableNotification', 'watchZones'];
var SALT = config.CRYPTO_SALT || 'This is the salt that is used for the crypto key.  This secret is used to ensure externals cannot guess the hash';

exports.createPasswordHash = function(password) {
    return crypto.createHash('sha1').update(password+SALT).digest('hex');
};

exports.createValidationCode = function(email, password) {
    return crypto.createHash('sha1').update(uuid.v4()+email+password+SALT).digest('hex');
};

// convert the normalised user object used in the app into a sanitised model for return from the API.
exports.userForResponse = function(item) {
    var userData = {};
    userData.auth = exports.createPasswordHash(item.userid);
    USER_MODEL_FOR_RESPONSE_FIELDS.forEach(function(key){
        userData[key] = typeof item[key] !== 'undefined' ? item[key] : '';
    });
    return userData;
};

// standardised interface functions.

exports.findUserByEmail = function(email, cb) {
    return db.findUserByKey('email',email.toLowerCase(),cb);
};

exports.findUserByEmailChangingTo = function(email, cb) {
    return db.findUserByKey('emailChangingTo',email.toLowerCase(),cb);
};

exports.deleteUser = function (userid, cb) {
    return db.deleteUserRecord(userid, cb);
};

exports.updateUser = function(userModel, cb) {
    userModel.updated = new Date().toISOString();
    return db.updateUserRecord(userModel, cb);
};

exports.createUser = function(userModel, cb) {
    userModel.userid = uuid.v4();
    userModel.updated = new Date().toISOString();
    userModel.emailChangingTo = userModel.emailChangingTo.toLowerCase();

    return db.createUserRecord(userModel, function(err,data){
        if(err) return cb(err);
        return cb(null, {result:userModel, code:userModel.emailValidationCode});
    });
};

exports.verifyUniqueEmail = function (email, found, notFound, error) {
    if (email === '' || email == null || email == undefined) {
        return notFound();
    }
    return db.findUserByKey('email', email.toLowerCase(), function (err, data) {
        if (err) return error(err)
        if (data) {
            return found(data);
        }
        return db.findUserByKey('emailChangingTo', email.toLowerCase(), function (err, data) {
            if (err) return error(err)
            if (data) {
                return found(data)
            }
            return notFound()
        });
    });
}
