'use strict';

var config = require('./src/config'),
    app = require('./src/app');

var conf = config(process.argv.slice(2));

try {
    app.run(conf, function(){
        console.log('INFO: Completed processing');
    });
} catch(error) {
    console.log('ERROR: Caught application error: '+error);
}
