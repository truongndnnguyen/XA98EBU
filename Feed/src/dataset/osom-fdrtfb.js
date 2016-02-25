var transfer = require('../transfer'),
    util = require('../util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json'),
    baseURL = null;

// create input and output directories to store intermediate files
exports.name = 'osom-fdrtfb';
exports.description = 'CFA total fire bans and fire danger ratings';
exports.category = 'osom';
exports.feeds = {
    s3: {
        Key: 'osom-fdrtfb.json',
        ContentType: 'application/json',
        Body: {}
    },
    statusPage: true,
    firehose: true,
    localview: true,
    cap: true
};
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
        return 'status' in result;
    });

    var tfb = todaysResults && todaysResults.length ? todaysResults[0] : data.results[0];
    if( tfb && tfb.status === 'Y') {
        exports.features = tfb.declareList.map(function(dec){
            if( dec.status.indexOf('YES')!==0 ) {
                return null;
            }
            var geom = geometryForRegion(dec.name);
            
            if(!geom) {
                log.error('No region found for: '+dec.name);
                exports.status = 'ERROR';
                return null;
            }
            geom.geometries[1].name = dec.name;

            var id = dec.name.replace(/\ /g,'_') + '/' + tfb.issueFor.replace(/\//g,'-');
            return {
                'type': 'Feature',
                'geometry': geom,
                'properties': {
                    'feedType': 'incident',
                    'id': id,
                    'category1': 'Fire',
                    'category2': 'Total Fire Ban',
                    'location': dec.name,
                    'status': dec.status.substring(6), // trim starting "YES - "
                    'webHeadline': tfb.declaration,
                    'created': util.parseDate(tfb.issueFor, ['DD/MM/YYYY']),
                    'url': baseURL + 'prepare/#!/fire/fire-danger-ratings',
                    'cssClass': 'tfb'
                }
            };
        }).filter(function(f){
            return f;
        });
    }
    exports.feeds.s3.Body = JSON.stringify(data);
};
