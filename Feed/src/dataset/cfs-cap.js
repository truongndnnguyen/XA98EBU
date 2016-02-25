var transfer = require('../transfer'),
    util = require('../util');

// create input and output directories to store intermediate files
exports.name = 'cfs-cap';
exports.description = 'SA Country Fire Service warnings feed';
exports.category = 'cfs';
exports.feeds = {
    // s3: {
    //     Key: 'cfs-cap-geojson.json',
    //     ContentType: 'application/json',
    //     Body: ''
    // },
    statusPage: false,
    interstate: true,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.CFS_CAP_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

function getSingleValue(obj, val) {
    if( obj[val] && obj[val].length ) {
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

// transform cap feed to geojson
exports.transform = function(data) {
    // var geojson = data.feed.entry.map(function(a) {
    //     var summary = getSingleValue(a,'summary'),
    //         alert = summary ? getSingleValue(summary,'alert') : null,
    //         info = alert ? getSingleValue(alert,'info') : null,
    //         area = info ? getSingleValue(info,'area') : null,
    //         circle = area ? getSingleValue(area, 'circle') : null;

    //     if( !info ) {
    //         return;
    //     }

    //     var geom = [];
    //     if( circle ) {
    //         var parts = circle.split(' ');
    //         var coords = parts[0].split(',');
    //         geom = {
    //             'type': 'Point',
    //             'coordinates': [coords[1], coords[0]]
    //         };
    //     }

    //     return {
    //         'type': 'Feature',
    //         'geometry': geom,
    //         'properties': {
    //             'feedType': 'warning',
    //             'id': getSingleValue(alert, 'id'),
    //             'category1': getSingleValue(info,'event'),
    //             'category2': getSingleValue(info,'severity'),
    //             'status': getSingleValue(alert,'msgType'),
    //             'name': getSingleValue(info,'headline'),
    //             'created': getSingleValue(info,'onset'),
    //             'updated': getSingleValue(summary,'updated'),
    //             'webBody': getSingleValue(info,'description'),
    //             'url': getSingleValue(info,'web'),
    //             'cssClass': 'warning',
    //             'magnitude': findParameterValue(info, 'Magnitude')
    //         }
    //     };
    // }).filter(function(a) {
    //     return a !== undefined;
    // });
    var geojson = [];
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": geojson
        });
    }
    exports.features = geojson;
};
