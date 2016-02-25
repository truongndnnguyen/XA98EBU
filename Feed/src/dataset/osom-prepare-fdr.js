var transfer = require('../transfer'),
    util = require('../util'),
    util2 = require('util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json'),
    baseURL = null;

// create input and output directories to store intermediate files
exports.name = 'prepare-fdr';
exports.description = 'CFA total fire bans map overlay';
exports.category = 'osom';
exports.feeds = {
    s3: {
        Key: 'osom-prepare-fdr.json',
        ContentType: 'application/json',
        Body: {}
    },
    statusPage: false,
    firehose: false,
    localview: false,
    prepare: true,
    cap: false
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
        return result.issueFor
    }).filter(function(result){
        return !('status' in result);
    });


    var allFeatures = [];
    exports.features = []; // just for the firehose and cap feeds
    var fdrCat = {
        "0": "Fire Danger Rating Today",
        "1": "Fire Danger Rating Tomorrow",
        "2": "Fire Danger Rating next 2 days",
        "3": "Fire Danger Rating next 3 days",
        "4": "Fire Danger Rating next 4 days"
    }
    todaysResults.map(function (fdr) {
        fdr.declareList.map(function (dec) {
            var geom = geometryForRegion(dec.name);
            if (!geom) {
                log.error('No region found for: ' + dec.name);
                exports.status = 'ERROR';
                return null;
            }
            var id = dec.name.replace(/\ /g, '_') + '/' + fdr.issueFor.replace(/\//g, '-');
            var dateDiff = util.dateDiff(fdr.issueFor, util.currentDate());
            var ft = {
                'type': 'Feature',
                'geometry': geom,
                'properties': {
                    'feedType': 'incident',
                    'id': id,
                    'category1': 'Fire',
                    'category2': fdrCat[dateDiff],
                    'location': dec.name,
                    'status': dec.status,
                    'webHeadline': dec.status + ' Fire Danger Rating for ' + dec.name + ' for ' + fdr.issueFor,
                    'created': util.parseDate(fdr.issueFor, ['DD/MM/YYYY']),
                    'url': 'http://www.cfa.vic.gov.au/warnings-restrictions/about-fire-danger-ratings/',
                    'cssClass': 'fdr'
                }
            };
            allFeatures.push(ft);
        })
    });

    exports.feeds.s3.Body = JSON.stringify({
        "type": "FeatureCollection",
        "features": allFeatures
    });

    exports.features = allFeatures;
};
