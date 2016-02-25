var transfer = require('../transfer'),
    async = require('async'),
    util = require('../util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json');

// create input and output directories to store intermediate files
exports.name = 'bom-cap';
exports.description = 'Bureau of Meteorology CAP feeds for weather warnings';
exports.category = 'bom';
exports.feeds = {
    // s3: {
    //     Key: 'bom-cap-geojson.json',
    //     ContentType: 'application/json',
    //     Body: ''
    // },
    statusPage: true,
    firehose: true,
    localview: true,
    textonly: true,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.configure(config);
    var requestors = {};
    config.BOM_CAP_FEEDS.forEach(function(feed){
        requestors[feed.name] = function(cbx) {
            transfer.issueXMLRequest(cbx, feed.url, exports.category+'/'+exports.name+'-'+feed.name+'.xml', {ignore404:true});
        };
    });
    async.parallel(requestors, function(err, results) {
        if (err) {
            log.error('Caught during BOM CAP feed fetch: '+err);
            cb(err, null);
            exports.status = 'ERROR';
            return;
        }
        log.info('Successfully retrieved BOM CAP feeds');
        cb(null, results);
    });
};

function getSingleValue(obj, val) {
    if( obj && obj[val] && obj[val].length ) {
        return obj[val][0];
    }
    return null;
}

function findParameterValue(obj, name) {
    if( obj.parameter.length ) {
        var param = obj.parameter.filter(function(p){
            return p.valueName[0] === name;
        });
        return param[0].value[0];
    }
    return null;
}

// transform ses warning feed to geojson
exports.transform = function(alldata) {
    // console.log(JSON.stringify(alldata,null,'  '));
    var features = [];

    Object.keys(alldata).map(function(key){
        return alldata[key];
    }).filter(function(f){
        return f;
    }).map(function(data){
        var alert = data['alert'], infoIdx=-1;
        features = alert['info'].map(function(info) {
            infoIdx++;
            // console.log("info: ", info)
            var area = info ? getSingleValue(info,'area') : null;
            var geocodes = area['geocode'].map(function(geocode){
                return geocode['value'][0];
            });

            var geoms = regions.features.filter(function(f){
                return geocodes.indexOf(f.properties.AAC) >= 0;
            }).map(function(f){
                f.geometry.geometries[1].name= f.properties.DIST_NAME
                return f.geometry;
            });

            //check for effective and expiry
            if( ! util.withinDateRange(getSingleValue(info,'effective'), getSingleValue(info,'expires')) ) {
                log.info('Suppressing BOM warning not effective/expired',getSingleValue(info,'effective'), getSingleValue(info,'expires'))
                return;
            }

            var transformObj = {
                'type': 'Feature',
                'geometry': {
                    'type': 'GeometryCollection',
                    'geometries': geoms
                },
                'properties': {
                    'feedType': 'incident',
                    'id': getSingleValue(alert, 'identifier')+'/'+infoIdx,
                    'category1': getSingleValue(info,'category'),
                    'category2': getSingleValue(info,'event'),
                    'status': getSingleValue(info,'severity'),
                    'location': getSingleValue(area,'areaDesc'),
                    'name': getSingleValue(info,'headline'),
                    'created': getSingleValue(info,'effective'),
                    'updated': getSingleValue(alert,'sent'),
                    'webHeadline': getSingleValue(info,'description') || getSingleValue(info,'headline'),
                    'webBody': getSingleValue(info,'description'),
                    'url': getSingleValue(info,'web')
                }
            };

            return transformObj;

        }).filter(function(a) {
            return a !== undefined;
        }).concat(features);
    });

    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": features
        });
    }
    exports.features = features;
};
