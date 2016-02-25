
exports.config = {};
exports.archive = [];

exports.reset = function(config) {
    exports.archive = [];
    exports.config = {};
    if( 'LOGGING' in config ) {
        exports.config = config.LOGGING;
    }
};

exports.msg = function(type, msgs) {
    var msg = msgs.join(' ');
    if( ('CONSOLE' in exports.config) && exports.config.CONSOLE ) {
        console.log(type+':', msg);
    }
    exports.archive.push({
        time: new Date(Date.now()).toISOString(),
        type: type,
        msg: msg
    });
};

exports.info = function() {
    var msgs = [];
    for(var i=0; i<arguments.length; i++) {
        msgs.push(arguments[i]);
    }
    exports.msg('INFO', msgs);
};

exports.warn = function() {
    var msgs = [];
    for(var i=0; i<arguments.length; i++) {
        msgs.push(arguments[i]);
    }
    exports.msg('WARN', msgs);
};

exports.err = function() {
    var msgs = [];
    for(var i=0; i<arguments.length; i++) {
        msgs.push(arguments[i]);
    }
    exports.msg('ERROR', msgs);
};

exports.error = function() {
    var msgs = [];
    for(var i=0; i<arguments.length; i++) {
        msgs.push(arguments[i]);
    }
    exports.msg('ERROR', msgs);
};
