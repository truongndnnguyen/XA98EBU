// create input and output directories to store intermediate files
exports.name = 'fail-request';
exports.category = 'unit-test';
exports.feeds = {
    firehose: true,
    textonly: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    cb(new Error('unit test intentional error'));
};

exports.transform = function(alldata, results) {
    console.log('nop: transform');
};

exports.integrate = function(datasetsMap, config) {
    console.log('nop: integrate');
};

exports.aggregate = function(datasets, config) {
    console.log('nop: aggregate');
};

exports.publishers = function(datasets, config) {
    console.log('nop: publishers');
    return [];
};
