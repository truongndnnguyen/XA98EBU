var uuid = require('uuid'),
    moment = require('moment'),
    crypto = require('crypto'),
    validation = require('./validation'),
    db = require('./postgresql');

// generic functions here

var USER_MODEL_FOR_RESPONSE_FIELDS = ['firstname', 'lastname', 'tocVersion', 'email', 'emailChangingTo', 'enableNotification', 'watchZones'];
//var SALT = config.CRYPTO_SALT || 'This is the salt that is used for the crypto key.  This secret is used to ensure externals cannot guess the hash';

exports.createPasswordHash = function(password, salt) {
    return crypto.createHash('sha1').update(password+salt).digest('hex');
};

exports.createValidationCode = function(email, password, salt) {
    return crypto.createHash('sha1').update(uuid.v4()+email+password+salt).digest('hex');
};

// convert the normalised user object used in the app into a sanitised model for return from the API.
exports.userForResponse = function(item, salt) {
    var userData = {};
    userData.auth = exports.createPasswordHash(item.userid, salt);
    USER_MODEL_FOR_RESPONSE_FIELDS.forEach(function(key){
        userData[key] = typeof item[key] !== 'undefined' ? item[key] : '';
    });
    return userData;
};

// standardised interface functions.

exports.findUserByEmail = function (email, connectionString, cb) {
    return db.findUserByKey('email', email.toLowerCase(), connectionString, cb);
};

exports.findUserByEmailChangingTo = function(email, connectionString, cb) {
    return db.findUserByKey('emailChangingTo', email.toLowerCase(), connectionString, cb);
};

exports.deleteUser = function (userid, connectionString, cb) {
    return db.deleteUserRecord(userid, connectionString, cb);
};


exports.disableEmailsForUser = function (email, salt, connectionString, cb) {
    return db.disableEmailsForUser(email, this.createValidationCode(email,"", salt), connectionString, cb);
};


exports.updateUser = function(userModel, connectionString, cb) {
    userModel.updated = new Date().toISOString();
    return db.updateUserRecord(userModel, connectionString, cb);
};

exports.createUser = function(userModel, connectionString, cb) {
    userModel.userid = uuid.v4();
    userModel.updated = new Date().toISOString();
    userModel.emailChangingTo = userModel.emailChangingTo.toLowerCase();

    return db.createUserRecord(userModel, connectionString, function(err,data){
        if(err) return cb(err);
        return cb(null, {result:userModel, code:userModel.emailValidationCode});
    });
};

exports.verifyUniqueEmail = function (email, connectionString, found, notFound, error) {
    if (email === '' || email == null || email == undefined) {
        return notFound();
    }
    return db.findUserByKey('email', email.toLowerCase(), connectionString, function (err, data) {
        if (err) return error(err)
        if (data) {
            return found(data);
        }
        return db.findUserByKey('emailChangingTo', email.toLowerCase(), connectionString, function (err, data) {
            if (err) return error(err)
            if (data) {
                return found(data)
            }
            return notFound()
        });
    });
}


exports.unsubscribe = function (userId, connectionString, cb) {
    return db.findUserByKey('userid', userId.toLowerCase(), connectionString, function (err, data) {
        if (err) return cb(err, null);
        if (data) {
            var currentDate = moment(new Date()).format("MM/DD/YYYY hh:mm:ss.00");
            return db.unsubscribeUser(data, currentDate, connectionString, cb);
        }
    });
}

