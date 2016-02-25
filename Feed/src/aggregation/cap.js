var transfer = require('../transfer'),
    cap = require('../ruleset/cap'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    filter = require('../filter'),
    log = require('../log'),
    helpers = require('../handlebars-helper');

// register helpers
helpers.register(handlebars);

// create input and output directories to store intermediate files
exports.name = 'cap';
exports.description = 'Public CAP-AU XML version of the incidents and warnings firehose, EDXL, RSS, and ATOM containers';
exports.category = 'osom';
exports.feeds = {};

exports.issueRequest = null;

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets, config) {
    cap.configure(config);

    var firehoseFeatures = [];
    datasets.forEach(function(dataset){
        if( dataset.feeds.cap === true ) {
            firehoseFeatures = firehoseFeatures.concat(dataset.features);
        }
    });

    var edxl = fs.readFileSync('config/templates/edxl-cap-xml.hbs').toString(),
        rss = fs.readFileSync('config/templates/rss-cap-xml.hbs').toString(),
        atom = fs.readFileSync('config/templates/atom-cap-xml.hbs').toString(),
        capTemplate = handlebars.compile(fs.readFileSync('config/templates/cap-xml.hbs').toString());

    var alerts = firehoseFeatures
    .filter(filter.inVictoria)
    .map(function(feature){
        return {
            properties: feature.properties,
            geometry: feature.geometry
        };
    })
    .map(cap.classify)
    .filter(function(f){
        return f !== undefined;
    })
    .map(function(alert){
        alert.xml = capTemplate(alert);
        return alert;
    });

    exports.feeds.s3collection = [{
        Key: 'edxl-cap.xml',
        ContentType: 'text/xml',
        ContentEncoding: 'gzip',
        Body: handlebars.compile(edxl)({
            timestamp: new Date().toISOString(),
            baseURL: config.EM_PUBLIC_SITE_URL,
            dataURL: config.EM_PUBLIC_DATA_URL,
            alerts: alerts
        })
    }, {
        Key: 'rss-cap.xml',
        ContentType: 'application/rss+xml',
        ContentEncoding: 'gzip',
        Body: handlebars.compile(rss)({
            timestamp: new Date().toISOString(),
            baseURL: config.EM_PUBLIC_SITE_URL,
            dataURL: config.EM_PUBLIC_DATA_URL,
            alerts: alerts
        })
    }, {
        Key: 'atom-cap.xml',
        ContentType: 'application/atom+xml',
        ContentEncoding: 'gzip',
        Body: handlebars.compile(atom)({
            timestamp: new Date().toISOString(),
            baseURL: config.EM_PUBLIC_SITE_URL,
            dataURL: config.EM_PUBLIC_DATA_URL,
            alerts: alerts
        })
    }];
};
