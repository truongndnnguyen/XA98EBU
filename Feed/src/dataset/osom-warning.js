var transfer = require('../transfer');

// create input and output directories to store intermediate files
exports.name = 'osom-warning';
exports.description = 'Combined MFB, CFA, and DELWP warnings feed';
exports.category = 'osom';
exports.feeds = {};

exports.issueRequest = function(config, cb) {
    transfer.issueOSOMRequest(cb, config, 'getWarningFeed', exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = null;
