var transfer = require('../transfer'),
    filter = require('../filter'),
    log = require('../log'),
    crypto = require('crypto');

// create input and output directories to store intermediate files
exports.name = 'relief-recovery';
exports.description = 'Combined feature data feed for relief recovery state view';
exports.category = 'osom';
exports.feeds = {
    statusPage: true,
    s3: {
        Key: 'osom-relief-recovery.json',
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        Body: {}
    }
};
exports.features = [];

function canonicalHash(data) {
    if( data === null ) return '';
    if( Array.isArray(data) ) {
        // process the array of data
        var sorted = data.map(canonicalHash);
        sorted.sort();

        var hash = crypto.createHash('sha1');
        sorted.map(function(d){
            hash.update(d);
        });
        return hash.digest('hex');
    } else if( typeof data === 'object' ) {
        // process the object
        var elements = [];
        for(var key in data) {
            elements.push(key + ':' + canonicalHash(data[key]));
        }
        elements.sort();

        var hash = crypto.createHash('sha1');
        elements.map(function(d){
            hash.update(d);
        });
        return hash.digest('hex');
    } else {
        var hash = crypto.createHash('sha1');
        hash.update(''+data);
        return hash.digest('hex');
    }
}

exports.issueRequest = null;

exports.transform = function(data) {
    //exports.featuresDelta = data;
};

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function (datasets) {
        exports.features = [];
        datasets.forEach(function (dataset) {
            if (dataset.feeds.relief === true) {
                var filters = dataset.features.filter(function (f) {
                    return f.properties.category1 === 'Recovery';
                })
                exports.features = exports.features.concat(filters);
        }
    });
    //var prefilterFeatures = exports.features.length;
    //exports.features = exports.features.filter(filter.inVictoria);
    //og.info(exports.name,'filtered out events more than buffer range from Victoria:',prefilterFeatures - exports.features.length);
    // transform firehose feed to geojson
    exports.feeds.s3.Body = JSON.stringify({
        "type": "FeatureCollection",
        "features": exports.features,
        "properties": {
            "lastUpdated": new Date().toISOString(),
            "featureCount": exports.features.length
        }
    });
};
