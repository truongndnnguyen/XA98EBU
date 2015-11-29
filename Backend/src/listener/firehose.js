var db = require('../postgresql');

exports.handler = function(event, context) {
    var message = event.Records[0].Sns.Message;
    if( typeof message === 'string' ) {
        message = JSON.parse(message);
    }
    console.log(JSON.stringify(message.properties,null,'  '));

    return db.notifyableUsers(message.geometry, function(err,data) {
        if(err) {
            return context.done(err);
        }
        context.done(null,'Finished matching, found '+data.rows.length+' matches');
    });
};
