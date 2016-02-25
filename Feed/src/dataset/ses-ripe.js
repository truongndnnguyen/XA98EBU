var transfer = require('../transfer'),
    util = require('../util');

var baseurl = null;

// create input and output directories to store intermediate files
exports.name = 'ses-ripe';
exports.description = 'VicSES warnings geolocation feed (Ripe)';
exports.category = 'ses';
exports.feeds = {
    statusPage: true,
    firehose: false,
    textonly: false,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    var endpoint = config.RIPE_JSON_ENDPOINT+'?v='+Date.now();
    baseurl = config.RIPE_BASE_ENDPOINT;
    transfer.issueJSONRequest(cb, endpoint, exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var sesincidentgeojson = data.events.filter(function(event){
        if( !event.type || !event.layerGroup || !event.name ) {
            return false;
        }
        return ( event.type === 'Warning' && event.agencyShort === 'VICSES' );
    }).map(function(event) {
        var locations = [];
            geometry = null;

        var points = event.geo.points.map(function(point){
            var loc = point.locationInfo || point.name || null;
            if( loc ) {
                locations.push(loc);
            }
            return {
                type: 'Point',
                coordinates: [point.longitude, point.latitude]
            };
        });
        if( !points || !points.length ) {
            return;
        } else if( points.length === 1 ) {
            geometry = points[0];
        } else {
            geometry = {
                type: 'GeometryCollection',
                geometries: points
            };
        }

        var location = locations.length ? locations.join(', ') : 'Unknown';

        return {
            'type': 'Feature',
            'geometry': geometry,
            'properties': {
                feedType: 'warning',
                id: event.id,
                category1: event.layerGroup,
                category2: event.name,
                created: new Date(event.createdTime).toISOString(),
                updated: new Date(event.updatedTime).toISOString(),
                location: location,
                incidentFeatures: [{
                    properties: {
                        category1: event.name,
                        category2: event.name,
                        feedType: 'incident',
                        location: location
                    }
                }],
                url: 'http://www.emergency.vic.gov.au/warnings/'+event.id+'_bare.html'
            }
        };
    }).filter(function(a) {
        return a !== undefined;
    });
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": sesincidentgeojson
        });
    }
    exports.features = sesincidentgeojson;
};
