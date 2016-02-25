var transfer = require('../transfer'),
    util = require('../util'),
    incidentRules = require('../ruleset/incidents');

// create input and output directories to store intermediate files
exports.name = 'ses-incident';
exports.description = 'VicSES incidents feed';
exports.category = 'ses';
exports.feeds = {
    // s3: {
    //     Key: 'osom-ses-incidents-geojson.json',
    //     ContentType: 'application/json',
    //     Body: {}
    // },
    statusPage: true,
    firehose: true,
    localview: true,
    textonly: true,
    cap: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueOSOMRequest(cb, config, 'getSESIncidentFeed', exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var sesIncidentFeedJson = data;
    var sesincidentgeojson = sesIncidentFeedJson.results.map(function(a) {
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [a.longitude, a.latitude]
            },
            'properties': {
                feedType: 'incident',
                category1: a.category1,
                category2: a.category2,
                created: util.parseDate(a.originDateTime), //"10/03/2015 16:05:05",
                cssClass: a.catg1CssClass,
                id: a.incidentNo,
                location: a.incidentLocation,
                resources: a.resourceCount,
                // size: a.incidentSize, // removed at request of SES
                // sizeFmt: a.incidentSizeFmt,
                status: a.incidentStatus,
                updated: util.parseDate(a.lastUpdateDateTime) //"12/03/2015 11:56:29",
            }
        };
    }).map(
        incidentRules.transform
    ).filter(function(a) {
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
