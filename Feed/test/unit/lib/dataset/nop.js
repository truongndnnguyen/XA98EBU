// create input and output directories to store intermediate files
exports.name = 'nop';
exports.category = 'unit-test';
exports.feeds = {
    firehose: true,
    textonly: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    cb(null,{});
};

exports.transform = function(alldata, results) {
};

exports.integrate = function(datasetsMap, config) {
};

exports.aggregate = function(datasets, config) {
};

exports.publishers = function(datasets, config) {
    return [];
};
