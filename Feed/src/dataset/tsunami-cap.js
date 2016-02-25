var transfer = require('../transfer'),
    async = require('async'),
    util = require('../util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json');

// create input and output directories to store intermediate files
exports.name = 'tsunami-cap';
exports.description = 'Bureau of Meteorology CAP feeds for tsunami warnings';
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
    textonly: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.TSUNAMI_CAP_ENDPOINT, exports.category+'/'+exports.name+'.xml', {ignore404:true});
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
    if(!alldata) {
        return;
    }
    var features = [];

    Object.keys(alldata).map(function(key){
        return alldata[key];
    }).filter(function(f){
        return f;
    }).map(function(data){
        var alert = data.alert;
        features = data.info.map(function(info) {

            var area = info ? getSingleValue(info,'area') : null;
            var geocodes = area['geocode'].map(function(geocode){
                return geocode['value'][0];
            });

            var geoms = regions.features.filter(function(f){
                return geocodes.indexOf(f.properties.AAC) >= 0;
            }).map(function(f){
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
                    'id': getSingleValue(info, 'identifier'),
                    'category1': getSingleValue(info,'category'),
                    'category2': getSingleValue(info,'event'),
                    'status': getSingleValue(info,'severity'),
                    'location': getSingleValue(area,'areaDesc'),
                    'name': getSingleValue(info,'headline'),
                    'created': getSingleValue(info,'effective'),
                    'updated': getSingleValue(alert,'sent'),
                    'webHeadline': getSingleValue(info,'headline'),
                    'webBody': getSingleValue(info,'description'),
                    'url': getSingleValue(info,'web'),
                    'regionName': geocodes
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
