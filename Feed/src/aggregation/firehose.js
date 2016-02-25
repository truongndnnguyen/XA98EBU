var transfer = require('../transfer'),
    filter = require('../filter'),
    log = require('../log'),
    crypto = require('crypto');

// create input and output directories to store intermediate files
exports.name = 'firehose';
exports.description = 'Combined feature data feed for EM-Public website';
exports.category = 'osom';
exports.feeds = {
    statusPage: true,
    s3: {
        Key: 'osom-geojson.json',
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        Body: {}
    }
};
exports.features = [];
exports.featuresDelta = null;

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

exports.issueRequest = function(config, cb) {
    if( config.S3_BUCKET.indexOf('file://')===0 ) {
        log.info('Not retrieiving firehose-delta from local file:// source');
        return cb(null,null);
    }
    var endpoint = 'http://' + config.S3_BUCKET + '/' + config.S3_BUCKET_PATH + 'osom-delta.json';
    transfer.issueJSONRequest(cb, endpoint, exports.category+'/'+exports.name+'-delta.json', {
        ignore404: true
    });
};

exports.transform = function(data) {
    exports.featuresDelta = data;
};

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets) {
    exports.features = [];
    datasets.forEach(function(dataset){
        if( dataset.feeds.firehose === true ) {
            exports.features = exports.features.concat(dataset.features);
        }
    });
    var prefilterFeatures = exports.features.length;
    exports.features = exports.features.filter(filter.inVictoria);
    log.info(exports.name,'filtered out events more than buffer range from Victoria:',prefilterFeatures - exports.features.length);

    // transform firehose feed to geojson
    exports.feeds.s3.Body = JSON.stringify({
        "type": "FeatureCollection",
        "features": exports.features,
        "properties": {
            "lastUpdated": new Date().toISOString(),
            "featureCount": exports.features.length
        }
    });

    var computedHash = canonicalHash(exports.features.filter(function(feature){
        return feature.properties && feature.properties.feedType === 'warning';
    }));

    if( exports.feeds.s3collection ) {
        delete exports.feeds.s3collection;
    }
    if( !exports.featuresDelta || exports.featuresDelta.lastHash !== computedHash ) {
        log.info('Updated firehose-delta.json with new hash');
        exports.feeds.s3collection = [{
            Key: 'osom-delta.json',
            ContentType: 'application/json',
            Body: JSON.stringify({
                lastModified: new Date().toISOString(),
                lastHash: computedHash
            })
        }];
    } else {
        log.info('No change detected in firehose-delta.json, since', exports.featuresDelta.lastModified);
    }
};
