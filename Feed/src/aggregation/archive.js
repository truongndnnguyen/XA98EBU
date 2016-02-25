var transfer = require('../transfer'),
    log = require('../log'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    moment = require('moment-timezone'),
    helpers = require('../handlebars-helper');

// register helpers
helpers.register(handlebars);

var archiveDatasets = [
    'textonly',
    'firehose'
];

// create input and output directories to store intermediate files
exports.name = 'archive';
exports.description = 'Archive of generated data files and status page';
exports.category = 'html';
exports.feeds = {
    s3collection: []
};

exports.issueRequest = null;

var statusMap = {
    OK: { cls: 'success', icon: 'ok-sign'},
    WARNING: { cls: 'warning', icon: 'warning-sign'},
    ERROR: { cls: 'danger', icon: 'exclamation-sign'}
};

function generateStatusPage(datasets, config) {
    var statusCounts = {'OK':0, 'WARNING':0, 'ERROR':0};
    datasets: datasets.filter(function(dataset){
        return dataset.feeds && dataset.feeds['statusPage'];
    }).map(function(dataset){
        statusCounts[dataset.status||'OK'] = (statusCounts[dataset.status||'OK']||0) + 1;
    });
    var status = statusCounts.ERROR ? 'ERROR' : (statusCounts.WARNING ? 'WARNING' : 'OK');

    var textonly = fs.readFileSync('config/templates/status.hbs').toString();
    return handlebars.compile(textonly)({
        baseURL: config.EM_PUBLIC_SITE_URL,
        dataURL: config.EM_PUBLIC_DATA_URL,
        logs: log.archive,
        now: new Date(Date.now()).toISOString(),
        status: status,
        statusClass: statusMap[status].cls,
        statusIcon: statusMap[status].icon,
        datasets: datasets.filter(function(dataset){
            return dataset.feeds && dataset.feeds['statusPage'];
        }).map(function(dataset){
            return {
                name: dataset.name,
                description: dataset.description,
                status: dataset.status,
                statusClass: statusMap[dataset.status] ? statusMap[dataset.status].cls : '',
                statusIcon: statusMap[dataset.status] ? statusMap[dataset.status].icon : '',
                features: dataset.features ? dataset.features.length : 'Unknown'
            };
        })
    });
}

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets, config) {
    var statusContent = generateStatusPage(datasets, config);
    var archivePath = 'archive/' + moment().tz('Australia/Melbourne').format('YYYY/MM/DD/HH/YYYYMMDD-HHmmss-');
    exports.feeds.s3collection = archiveDatasets.map(function(datasetName){
        return datasets.filter(function(dataset){
            return dataset.name === datasetName;
        })[0];
    }).map(function(dataset){
        return {
            Key: archivePath+dataset.feeds.s3.Key,
            ContentType: dataset.feeds.s3.ContentType,
            ContentEncoding: 'gzip',
            Body: dataset.feeds.s3.Body
        };
    }).concat([{
        Key: archivePath+'log.json',
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        Body: JSON.stringify(log.archive, null, '  ')
    }, {
        Key: 'status.html',
        ContentType: 'text/html',
        ContentEncoding: 'gzip',
        Body: statusContent
    }]);
};
