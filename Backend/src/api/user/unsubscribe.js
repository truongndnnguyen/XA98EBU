var user = require('../../user'),
	config = require('../../lambda_configs/config-user-unsubscribe.json');

exports.handler = function (event, context) {
    return user.unsubscribe(event.userId, config.POSTGRES_URL, function (err, data) {
        if (err) {
            return context.done(err, { error: {} });
        }
        else {
            return context.done(null, { result: {} });
        }
    })
    
};
