'use strict';

var rules = require('../rules'),
    log = require('../log');

exports.name = 'ruleset-incidents';

exports.transform = function(feature) {
    var matches = rules.executeMultiMatch(exports.transforms,
        [feature.properties.feedType, feature.properties.category1, feature.properties.category2, feature.properties.status]);
    if( !matches || !matches.length ) {
        return feature;
    }

    matches.forEach(function(match){
        if( match.suppress === true ) {
            feature.suppress = true;
            return;
        }

        if( match.suppressByTimeSinceLastUpdate ) {
            // test age
            var ageInMS = Date.now() - Date.parse(feature.properties.updated);
            if( ageInMS > match.suppressByTimeSinceLastUpdate*60*60*1000) {
                log.info('Suppressing safe incident, age: '+ageInMS);
                feature.suppress = true;
                return;
            }
        }

        if( match.category1 ) {
            feature.properties.category1 = match.category1;
        }

        if( match.category2 ) {
            feature.properties.category2 = match.category2;
        }
    });

    if( feature.suppress ) {
        return;
    }

    if( feature.properties && feature.properties.incidentFeatures ) {
        feature.properties.incidentFeatures = feature.properties.incidentFeatures.filter(exports.transform);
    }

    return feature;
};

exports.transforms = [
    {
        suppressByTimeSinceLastUpdate: 1, //hours
        rules: [
            ['incident','Fire','*', 'Safe']
        ]
    }, {
        suppress: true,
        rules: [
            ['incident','Medical','Medical'],
            ['incident','Medical','Medical Emergency'],
            ['incident','Other','Assist - Ambulance Vic'],
            ['incident','*','Battery Fault'],
            ['incident','*','Equipment Fault'],
            ['incident','*','Full Call'],
            ['incident','*','Late Notification'],
            ['incident','*','Line Fault'],
            ['incident','*','Move Up'],
            ['incident','*','Part Call'],
            ['incident','*','Test Timeout'],
            ['incident','*','Trivial Calls'],
            ['incident','*','False Alarm']
        ]
    }, {
        suppress: false,
        category2: 'Other',
        rules: [
            ['incident','*','Incident'],
            ['incident','Other','SES Incident Other']
        ]
    }, {
        suppress: false,
        category2: 'Hazardous Material',
        rules: [
            ['*','*','CBRNE'],
            ['*','CBRNE']
        ]
    }, {
        suppress: false,
        category2: 'Rescue',
        rules: [
            ['incident','Accident / Rescue','Usar'],
            ['incident','Accident / Rescue','Trench Rescue']
        ]
    }, {
        suppress: false,
        category1: 'Tree Down',
        category2: 'Tree Down',
        rules: [
            ['incident','Tree Down Traffic Hazard','Tree Down Traffic Hazard']
        ]
    }, {
        suppress: false,
        category2: 'Building Fire',
        rules: [
            ['incident','Fire','Building']
        ]
    }
];
