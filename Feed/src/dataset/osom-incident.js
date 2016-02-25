var transfer = require('../transfer'),
    util = require('../util'),
    incidentRules = require('../ruleset/incidents');

// create input and output directories to store intermediate files
exports.name = 'osom-incident';
exports.description = 'Combined MFB, CFA, and DELWP incidents feed';
exports.category = 'osom';
exports.feeds = {
    // s3: {
    //     Key: 'osom-incidents-geojson.json',
    //     ContentType: 'application/json',
    //     Body: {}
    // },
    statusPage: true,
    firehose: true,
    textonly: true,
    localview: true,
    cap: true
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueOSOMRequest(cb, config, 'getIncidentFeed', exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var incidentFeedJson = data;
    var incidentgeojson = incidentFeedJson.results.map(function(a) {
        // special rule for location mapping
        var location = a.incidentLocation,
            name = a.name,
            agency = a.agency;
        if( agency && (agency === 'CFA' || agency === 'MFB') ) {
            if( name && (name !== location) ) {
                location = name +', '+ location;
            }
        }

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
                location: location,
                resources: a.resourceCount,
                size: a.incidentSize,
                sizeFmt: a.incidentSizeFmt,
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
            "features": incidentgeojson
        });
    }
    exports.features = incidentgeojson;
};
