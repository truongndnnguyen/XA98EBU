
exports.validatePasswordComplexity = function(password) {
    if( password &&
        password.match('[a-z]') &&
        password.match('[A-Z]') &&
        password.match('[0-9]') &&
        password.length >= 6 ) {
        return;
    } else {
        return {
            code: 'passwordComplexity',
            message: 'Password must be at least 6 characters long and contain a mixture of upper and lower case letters and numbers'
        };
    }
};
