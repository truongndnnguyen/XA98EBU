var AWS = require('aws-sdk'),
    transfer = require('../transfer'),
    filter = require('../filter'),
    crypto = require('crypto'),
    log = require('../log'),
    fs = require('fs'),
    zlib = require('zlib');

// create input and output directories to store intermediate files
exports.name = 'aws-delta';
exports.description = 'Feed of new, changed, and deleted incidents and warnings';
exports.category = 'osom';
exports.feeds = {};
exports.issueRequest = null;
exports.features = [];
exports.eventMap = null;

exports.issueRequest = function(config, cb) {
    if( config.S3_BUCKET.indexOf('file://')===0 ) {
        // read from a local file instead...
        var data = fs.readFileSync(config.S3_BUCKET_PATH+'osom-geojson.json');
        log.info('Successfully retrieved old firehose from localhost - '+config.S3_BUCKET_PATH);
        try {
            cb(null, JSON.parse(data));
        } catch(err) {
            log.error('Error when parsing JSON old firehose data for delta', err);
            cb(null,null);
        }
        return;
    }
    var S3 = new AWS.S3({
        region: 'ap-southeast-2'
    });
    var config = {
        Bucket: config.S3_BUCKET,
        Key: config.S3_BUCKET_PATH+'osom-geojson.json'
    };
    S3.getObject(config, function(err,data){
        if(err) {
            log.error('Error when retrieving old firehose data for delta', err);
            cb(null,null);
        } else {
            log.info('Successfully retrieved old firehose from',config.Bucket, config.Key);
            var decodedBody = data.Body;
            try {
                if( data.ContentEncoding === 'gzip' ) {
                    zlib.gunzip(decodedBody, function(err,data){
                        if( err ) {
                            log.error('Error when gunzipping old firehose data for delta', err);
                            return cb(null,null);
                        }
                        return cb(null, JSON.parse(data));
                    });
                } else {
                    cb(null, JSON.parse(decodedBody));
                }
            } catch(err) {
                log.error('Error when parsing JSON old firehose data for delta', err);
                cb(null,null);
            }
        }
    });
};

function idForFeature(feature, hash) {
    if( feature.properties && feature.properties.feedType ) {
        if( feature.properties.id ) {
            return feature.properties.feedType + '/' + feature.properties.id;
        } else {
            return feature.properties.feedType + '/' + hash;
        }
    }
    return null;
}

function hashForFeature(feature) {
    var str = JSON.stringify(feature);
    return crypto.createHash('sha1').update(str).digest('hex');
}

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    exports.eventMap = null;
    if( data ) {
        exports.eventMap = {};
        data.features.forEach(function(feature){
            var hash = hashForFeature(feature);
            var id = idForFeature(feature, hash);
            if( id ) {
                exports.eventMap[id] = hash;
            }
        });
    }
};

exports.publishers = function(datasets, config) {
    if( !config.AWS_DELTA_SNS_ARN || !config.AWS_DELTA_SNS_REGION ) {
        return [];
    }
    if( !exports.eventMap ) {
        return [];
    }

    var sns = new AWS.SNS({
        region: config.AWS_DELTA_SNS_REGION
    });

    datasets.forEach(function(dataset){
        if( dataset.name === 'firehose' ) {
            exports.features = dataset.features;
        }
    });

    return exports.features.filter(function(feature){
        //delta?
        var hash = hashForFeature(feature);
        var id = idForFeature(feature, hash);
        if( id ) {
            var previous = exports.eventMap[id];
            if( ! previous ) {
                // new
                return true;
            } else if( previous !== hash ) {
                // changed -- disable for now
                return false;
            }
        }
        return false;
    }).map(function(feature){
        return function(cb) {
            log.info('Publishing notice for new/changed event', idForFeature(feature,'[hash]'));
            sns.publish({
                Message: JSON.stringify(feature),
                // MessageStructure: 'json',
                TargetArn: config.AWS_DELTA_SNS_ARN
            }, cb);
        };
    });
};
