'use strict';

function computeDelayTime(conf, startTime, remainingRuntimeAtStartofRun) {
    var min = conf.SCHEDULER_MIN_INTERVAL || 0;
    var max = conf.SCHEDULER_MAX_INTERVAL || 0;

    var lastRuntime = (Date.now()-startTime);
    var delayTime = startTime + max - Date.now();
    delayTime = delayTime < min ? min : delayTime;
    var remainingRuntime = remainingRuntimeAtStartofRun - (Date.now()-startTime);

    console.log('INFO: Last runtime was:', lastRuntime/1000,'seconds,',
        'remaining runtime:', remainingRuntime/1000,'seconds,',
        'delay sleep time:', delayTime/1000,'seconds');

    if( remainingRuntime < (delayTime + lastRuntime + 1000) ) {
        console.log('INFO: Insufficient time for another run, terminating');
        return -1;
    } else {
        console.log('INFO: Sleeping until next run, for:',delayTime/1000,'seconds');
        return delayTime;
    }
}

function scheduler(conf, event, context, remainingRuns, remainingRuntime, errors) {
    var startTime = Date.now();
    try {
        require('./src/app').run(conf, function(){
            console.log('INFO: Completed processing without error');
            var delay = computeDelayTime(conf, startTime, remainingRuntime);
            if( remainingRuns && delay >= 0 ) {
                setTimeout( function(){
                    scheduler(conf, event, context, remainingRuns-1, remainingRuntime-(Date.now()-startTime), errors);
                }, delay);
            } else {
                console.log('INFO: Completed processing');
                if( errors.length ) {
                    context && context.done('error',errors);
                } else {
                    context && context.done(null,'');
                }
            }
        });
    } catch(error) {
        errors.push(error);
        console.log('ERROR: Caught application error: '+error);
        var delay = computeDelayTime(conf, startTime, remainingRuntime);
        if( remainingRuns && delay >= 0 ) {
            setTimeout( function(){
                scheduler(conf, event, context, remainingRuns-1, remainingRuntime-(Date.now()-startTime), errors);
            }, delay);
        } else {
            console.log('INFO: Completed processing with error: '+error);
            context && context.done('error',errors);
        }
    }
}

exports.generic = function(conf, event, context, remainingRuns, remainingRuntime) {
    scheduler(conf, event, context, remainingRuns-1, remainingRuntime, []);
};

exports.test = function(event, context) {
    var config = require('./src/config');
    var conf = config([
        'config/inputs/production.json',
        'config/outputs/localhost.json',
        'config/options/run-forever.json'
    ]);
    exports.generic(conf, event, context, conf.SCHEDULER_EXECUTIONS, conf.SCHEDULER_RUNTIME);
};

exports.ci = function(event, context) {
    var config = require('./src/config');
    var conf = config([
        'config/inputs/production.json',
        'config/outputs/ci.json',
        'config/options/no-storage.json',
        'config/options/run-5min-no-delay.json'
    ]);
    exports.generic(conf, event, context, conf.SCHEDULER_EXECUTIONS, conf.SCHEDULER_RUNTIME);
};

exports.pvt = function(event, context) {
    var config = require('./src/config');
    var conf = config([
        'config/inputs/production.json',
        'config/outputs/pvt.json',
        'config/options/no-storage.json',
        'config/options/run-5min-no-delay.json'
    ]);
    exports.generic(conf, event, context, conf.SCHEDULER_EXECUTIONS, conf.SCHEDULER_RUNTIME);
};

exports.prod = function(event, context) {
    var config = require('./src/config');
    var conf = config([
        'config/inputs/production.json',
        'config/outputs/prod.json',
        'config/options/no-storage.json',
        'config/options/run-5min-no-delay.json'
    ]);
    exports.generic(conf, event, context, conf.SCHEDULER_EXECUTIONS, conf.SCHEDULER_RUNTIME);
};
