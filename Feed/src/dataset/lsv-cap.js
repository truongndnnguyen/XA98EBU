var transfer = require('../transfer'),
    util = require('../util'),
    log = require('../log');

// create input and output directories to store intermediate files
exports.name = 'lsv-cap';
exports.description = 'Life Saving Victoria shark sighting feed';
exports.category = 'lsv';
exports.feeds = {
    statusPage: true,
    firehose: true,
    localview: true,
    textonly: true,
    cap: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.LSV_CAP_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

function getSingleValue(obj, val) {
    if( obj[val] && obj[val].length ) {
        return obj[val][0];
    }
    return null;
}

// transform cap feed to geojson
exports.transform = function(data) {
    var feed = data['feed'];
    if( !feed ) {
        log.error('LSV Cap feed missing basic structural element alerts');
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
    var geojson = (feed['entry'] || []).map(function(entry) {
        var content = getSingleValue(entry, 'content'),
            alert = content ? getSingleValue(content, 'alert') : null,
            info = alert ? getSingleValue(alert,'info') : null,
            area = info ? getSingleValue(info,'area') : null,
            circle = area ? getSingleValue(area, 'circle') : null,
            status = info ? getSingleValue(info, 'severity') : null,
            headline = info ? getSingleValue(info, 'headline') : null,
            certainty = info ? getSingleValue(info, 'certainty') : null,
            eventCodePack = info ? getSingleValue(info, 'eventCode') : null,
            areaDesc = area ? getSingleValue(area,'areaDesc') : null,
            isSharkSighting = info ? getSingleValue(info,'event') === 'Dangerous Animal' : false,
            category1 = isSharkSighting ? 'Environment' : 'Other',
            category2 = isSharkSighting ? 'Shark Sighting' : 'Beach Closure';

        if( !info ) {
            return;
        }

        if( isSharkSighting ) {
            if( certainty === 'Possible' ) {
                status = 'Unconfirmed sighting';
            } else {
                status = 'Reported sighting';
            }
        }

        if( areaDesc === 'Incident Location' ) {
            areaDesc = 'Refer to map for location';
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

        var geom = null;
        if( geometries.length > 1 ) {
            geom = {
                'type': 'GeometryCollection',
                'geometries': geometries
            };
        } else if( geometries.length === 1 ) {
            geom = geometries[0];
        } else {
            return;
        }

        // simple incident
        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': {
                'cap': {
                    category: getSingleValue(info, 'category'),
                    event: getSingleValue(info, 'event'),
                    eventCode: eventCodePack ? getSingleValue(eventCodePack, 'value') : null,
                    urgency: getSingleValue(info, 'urgency'),
                    severity: getSingleValue(info, 'severity'),
                    certainty: getSingleValue(info, 'certainty'),
                    contact: getSingleValue(alert, 'sender'),
                    senderName: getSingleValue(info, 'senderName')
                },
                'feedType': 'incident',
                'id': getSingleValue(alert, 'identifier'),
                'category1': category1,
                'category2': category2,
                'status': status,
                'name': headline,
                'location': areaDesc,
                'webHeadline': getSingleValue(info,'description'),
                'created': getSingleValue(alert,'sent'),
                'updated': getSingleValue(alert,'sent'),
                'url': getSingleValue(info,'web') || 'http://www.lsv.com.au/#!'+getSingleValue(alert, 'identifier')
            }
        };
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
