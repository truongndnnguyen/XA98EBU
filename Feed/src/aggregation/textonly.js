var transfer = require('../transfer'),
    ruleset = require('../ruleset/osom'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    filter = require('../filter'),
    log = require('../log'),
    moment = require('moment-timezone'),
    helpers = require('../handlebars-helper');

// register helpers
helpers.register(handlebars);

// create input and output directories to store intermediate files
exports.name = 'textonly';
exports.description = 'Rendered HTML-only version of the incidents and warnings firehose';
exports.category = 'html';
exports.feeds = {
    s3: {
        Key: 'textonly.html',
        ContentType: 'text/html',
        ContentEncoding: 'gzip',
        Body: {}
    },
    s3collection: []
};

exports.issueRequest = null;

exports.featureSort = function(a,b) {
    // sort the features based on riskRating
    var ac = a.classification;
    var bc = b.classification;
    if( ac.riskRating === bc.riskRating ) {
        var ad = moment.tz(a.classification.updatedTime, ['DD/MM/YYYY HH:mm:ss','DD/MM/YY hh:mm:ss', moment.defaultFormat], 'Australia/Melbourne');
        var bd = moment.tz(b.classification.updatedTime, ['DD/MM/YYYY HH:mm:ss','DD/MM/YY hh:mm:ss', moment.defaultFormat], 'Australia/Melbourne');
        return ad.isAfter(bd) ? -1 : (ad.isBefore(bd) ? 1 : 0);
    }
    return (ac.riskRating > bc.riskRating) ? -1 : 1;
};

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets, config) {
    var firehoseFeatures = [];
    datasets.forEach(function(dataset){
        if( dataset.feeds.textonly === true ) {
            firehoseFeatures = firehoseFeatures.concat(dataset.features);
        }
    });

    var features = firehoseFeatures.filter(
        filter.inVictoria
    ).map(function(feature){
        try{
            return {
                classification: ruleset.classify(feature),
                properties: feature.properties
            };
        } catch(err) {
            log.warn('Dropping incident from text-only due to exception during classification:',err,
                JSON.stringify(feature.properties,null,'  '));
            return;
        }
    }, this).filter(function(f){
        return f !== undefined;
    }).sort(this.featureSort);

    var textonly = fs.readFileSync('config/templates/textonly.hbs').toString();
    var template = handlebars.compile(textonly);
    var html = template({
        baseURL: config.EM_PUBLIC_SITE_URL,
        dataURL: config.EM_PUBLIC_DATA_URL,
        features: features
    });

    // transform firehose feed to geojson
    exports.feeds.s3.Body = html;

    // generate detail pages
    var detailTemplateFile = fs.readFileSync('config/templates/textonly-detail.hbs').toString();
    var detailTemplate = handlebars.compile(detailTemplateFile);
    exports.feeds.s3collection = features.map(function(feature){
        return {
            Key: 'event'+feature.classification.deeplinkurl+'.html',
            ContentType: 'text/html',
            ContentEncoding: 'gzip',
            Body: detailTemplate({
                baseURL: config.EM_PUBLIC_SITE_URL,
                dataURL: config.EM_PUBLIC_DATA_URL,
                feature: feature
            })
        };
    });
};
