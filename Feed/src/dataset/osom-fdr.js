var transfer = require('../transfer'),
    util = require('../util'),
    util2 = require('util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json'),
    baseURL = null;

// create input and output directories to store intermediate files
exports.name = 'osom-fdr';
exports.description = 'CFA total fire bans map overlay';
exports.category = 'osom';
exports.feeds = {
    s3: {
        Key: 'osom-fdr.json',
        ContentType: 'application/json',
        Body: {}
    },
    statusPage: true,
    firehose: true,
    localview: true,
    cap: true
};
//firehose features
exports.features = [];

var geometryForRegion = function(region) {
    var matches = regions.features.filter(function(feature){
        return (feature.properties.DIST_NAME === region) &&
            (feature.properties.SOURCE === 'BOM');
    });
    return (matches && matches.length && matches[0].geometry) || null;
};

exports.issueRequest = function(config, cb) {
    baseURL = config.EM_PUBLIC_SITE_URL;
    transfer.issueOSOMRequest(cb, config, 'getFDRTFBJSON', exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    exports.features = [];

    var today = util.currentDate('DD/MM/YYYY');
    var todaysResults = data.results.filter(function(result){
        return result.issueFor && result.issueFor === today;
    }).filter(function(result){
        return !('status' in result);
    });

    var fdr = todaysResults && todaysResults.length ? todaysResults[0] : null;
    if( fdr === null ) {
        // fall back to the first item in the list...
        fdr = data.results.filter(function(result){
            return !('status' in result);
        })[0];
    }

    var allFeatures = fdr.declareList.map(function(dec){
        exports.features = []; // just for the firehose and cap feeds
        var geom = geometryForRegion(dec.name);
        if(!geom) {
            log.error('No region found for: '+dec.name);
            exports.status = 'ERROR';
            return null;
        }
        var id = dec.name.replace(/\ /g,'_') + '/' + fdr.issueFor.replace(/\//g,'-');
        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': {
                'feedType': 'incident',
                'id': id,
                'category1': 'Fire',
                'category2': 'Fire Danger Rating',
                'location': dec.name,
                'status': dec.status,
                'webHeadline': dec.status+' Fire Danger Rating for '+dec.name+' for '+fdr.issueFor,
                'created': util.parseDate(fdr.issueFor, ['DD/MM/YYYY']),
                'url': 'http://www.cfa.vic.gov.au/warnings-restrictions/about-fire-danger-ratings/',
                'cssClass': 'fdr'
            }
        };
    }).filter(function(f){
        return f;
    });

    exports.feeds.s3.Body = JSON.stringify({
        "type": "FeatureCollection",
        "features": allFeatures
    });

    exports.features = allFeatures.filter(function(feature){
        return feature.properties.status === 'CODE RED';
    });
};
