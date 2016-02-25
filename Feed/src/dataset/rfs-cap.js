var transfer = require('../transfer'),
    util = require('../util'),
    log = require('../log');

// create input and output directories to store intermediate files
exports.name = 'rfs-cap';
exports.description = 'NSW Rural Fire Service warnings and incidents feed';
exports.category = 'rfs';
exports.feeds = {
    // s3: {
    //     Key: 'rfs-cap-geojson.json',
    //     ContentType: 'application/json',
    //     Body: ''
    // },
    statusPage: true,
    firehose: true,
    localview: true,
    textonly: true,
    interstate: true,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.RFS_CAP_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

function getSingleValue(obj, val) {
    if( obj[val] && obj[val].length ) {
        return obj[val][0];
    }
    return null;
}

function findParameterValue(obj, name) {
    if( obj['parameter'].length ) {
        var param = obj['parameter'].filter(function(p){
            return p['valueName'][0] === name;
        });
        return param[0]['value'][0];
    }
    return null;
}

// transform cap feed to geojson
exports.transform = function(data) {
    if( ! data['EDXLDistribution'] ) {
        log.error('RFS Cap feed missing basic structural element EDXLDistribution');
        exports.status = 'ERROR';
        exports.features = [];
        if( exports.feeds.s3 ) {
            exports.feeds.s3.Body = JSON.stringify({
                "type": "FeatureCollection",
                "features": exports.features
            });
        }
        return;
    }
    var geojson = data['EDXLDistribution']['contentObject'].map(function(a) {
        var xmlContent = getSingleValue(a,'xmlContent'),
            embeddedXMLContent = xmlContent ? getSingleValue(xmlContent,'embeddedXMLContent') : null,
            alert = embeddedXMLContent ? getSingleValue(embeddedXMLContent,'alert') : null,
            info = alert ? getSingleValue(alert,'info') : null,
            area = info ? getSingleValue(info,'area') : null,
            polygon = area ? getSingleValue(area, 'polygon') : null,
            circle = area ? getSingleValue(area, 'circle') : null,
            alertLevel = info ? findParameterValue(info,'AlertLevel') : null,
            status = info ? findParameterValue(info,'Status') : null,
            incidentStatus = info ? getSingleValue(info,'severity') : null,
            webBody = info ? getSingleValue(info,'description') : null;

        if( !info ) {
            return;
        }

        //attempt to parse html for incident status
        if( webBody && webBody.indexOf('STATUS:')>=0 ) {
            // &gt;STATUS:  Under control&lt;
            var m = webBody.match(/STATUS:\s+([a-zA-Z0-9 ]+)/);
            if( m.length >= 2 ) {
                incidentStatus = m[1];
            }
        }

        var geometries = [];
        if( circle ) {
            var parts = circle.split(' ');
            var coords = parts[0].split(',');
            geometries.push({
                'type': 'Point',
                'coordinates': [coords[1], coords[0]]
            });
        }
        if( polygon ) {
            geometries.push({
                'type': 'Polygon',
                'coordinates': [polygon.split(/ /).map(function(f) {
                    return f.split(/,/).reverse();
                })]
            });
        }
        var geom = null;
        if( geometries.length > 1 ) {
            geom = {
                'type': 'GeometryCollection',
                'geometries': geometries
            };
        } else if( geometries.length === 1 ) {
            geom = geometries[0];
        }
        var category2 = getSingleValue(info,'event');
        if( status && (status === 'Hazard Reduction')) {
            category2 = 'Planned Burn';
        }
        var incidentProperties = {
            'feedType': 'incident',
            'id': getSingleValue(alert, 'identifier'),
            'category1': getSingleValue(info,'category'),
            'category2': category2,
            'status': incidentStatus,
            'name': getSingleValue(info,'headline'),
            'location': getSingleValue(area,'areaDesc'),
            'created': getSingleValue(info,'effective'),
            'updated': getSingleValue(alert,'sent'),
            'webHeadline': getSingleValue(info,'instruction'),
            'url': getSingleValue(info,'web'),
            // 'webBody': webBody,
            'sizeFmt': findParameterValue(info,'Fireground')
        };
        if( !alertLevel || alertLevel === 'Not Applicable' ) {
            // simple incident
            return {
                'type': 'Feature',
                'geometry': geom,
                'properties': incidentProperties
            };
        } else {
            // incident + warning
            return {
                'type': 'Feature',
                'geometry': geom,
                'properties': {
                    'feedType': 'warning',
                    'id': getSingleValue(alert, 'identifier'),
                    'category1': alertLevel,
                    'category2': getSingleValue(info,'category'),
                    'status': getSingleValue(info,'severity'),
                    'name': getSingleValue(info,'headline'),
                    'location': 'Issued by '+getSingleValue(info,'senderName'),
                    'created': getSingleValue(info,'effective'),
                    'updated': getSingleValue(alert,'sent'),
                    'url': getSingleValue(info,'web'),
                    'webHeadline': getSingleValue(info,'instruction'),
                    // 'webBody': webBody,
                    'sizeFmt': findParameterValue(info,'Fireground'),
                    'incidentFeatures': [{
                        'properties': incidentProperties
                    }]
                }
            };
        }
    }).filter(function(a) {
        return a !== undefined;
    });
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": geojson
        });
    }
    exports.features = geojson;
};
