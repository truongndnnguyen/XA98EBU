var transfer = require('../transfer'),
    util = require('../util'),
    log = require('../log'),
    regions = require('../../config/reference/ses-regions-with-points.json');

// create input and output directories to store intermediate files
exports.name = 'ses-warning';
exports.description = 'VicSES warnings feed';
exports.category = 'ses';
exports.feeds = {
    // s3: {
    //     Key: 'osom-ses-warnings-geojson.json',
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

function regionsToGeometry(regionsString) {
    var regionsMap = {};
    regionsString.split(/\,\s*/).map(function(region){
        regionsMap[region] = region;
    });
    var geom = regions.features.filter(function(f){
        return f.properties.title in regionsMap;
    }).map(function(f){
        return f.geometry;
    }).map(function(geom){
        // Business Rule change @ 6-Nov-15, only display region centrepoints for SES regions
        if(geom.type === 'GeometryCollection') {
            var geoms = geom.geometries.filter(function(g){
                // Business Rule change @ 9-Nov-15, actually, only display the polygon for point+polygon collections
                return g.type !== 'Point';
            });
            if(geoms.length) {
                // Business Rule change @ 9-Nov-15, actually, only display the polygon for point+polygon collections
                // return geoms[0];
                // use all the geoms, not the single value
                return {
                    type: 'GeometryCollection',
                    geometries: geoms
                };
            }
        }
        return geom;
    });
    if( ! geom.length ) {
        log.warn('No region mappings found for SES warning ('+regionsString+')');
        return;
    }
    if( geom.length === 1 ) {
        geom = geom[0]; // not a collection
    } else {
        geom = {
            type: 'GeometryCollection',
            geometries: geom
        };
    }
    return geom;
}

function categoriseBySubject(subject) {
    var eventType, category, location, regionString;

    if( subject.match(/^AUTO/i) || subject.match(/^Re\:/i) ) {
        return;
    }

    var warningWithStatus =
            subject.match(/^(.*) (Warning) for (.*) for (.*)$/) ||
            subject.match(/^(.*) (Community Update) for (.*) for (.*)$/);
    var specificWarning =
            subject.match(/^(.*) (Flood) (Warning) for (.*)$/) ||
            subject.match(/^(.*) (Earthquake) (Warning) for (.*)$/);
    var specificAdvice =
            subject.match(/^Initial (Flood) (Watch) for (.*)$/) ||
            subject.match(/^(Flood) (Watch) for (.*)$/) ||
            subject.match(/^(Flood) (.*) Notification for (.*)$/) ||
            subject.match(/^(Earthquake) (Watch) for (.*)$/) ||
            subject.match(/^(Earthquake) (.*) Notification for (.*)$/) ||
            subject.match(/^(Tsunami) (.*) Notification for (.*)$/);
    var tsunamiFormat =
            subject.match(/^(Marine) (Tsunami) (Warning) for (.*)$/) ||
            subject.match(/^(Land) (Tsunami) (Warning) for (.*)$/);
    var genericFormat =
            subject.match(/^(.*) (Community Update) for (.*)$/) ||
            subject.match(/^(.*) (Advice) for (.*)$/);

    if( warningWithStatus ) {
        eventType = warningWithStatus[1]; //Severe Weather
        category = warningWithStatus[2]; //Warning
        // subcategory = warningWithStatus[3]; //Rain, etc
        location = warningWithStatus[4]; // BOM regions
    } else if( specificWarning ) {
        category = specificWarning[1]; //Minor
        eventType = specificWarning[2]; //Flood
        // subcategory = specificWarning[3]; //Rain, etc
        location = specificWarning[4]; // BOM regions
    } else if( specificAdvice ) {
        eventType = specificAdvice[1]; //Flood
        category = specificAdvice[2]; //Watch, Evacuate Immediately
        // subcategory = specificAdvice[3]; //Rain, etc
        location = specificAdvice[3]; // BOM regions
    } else if( tsunamiFormat ) {
        eventType = tsunamiFormat[2]; //Tsunami
        category = tsunamiFormat[1]; //Warning
        // subcategory = tsunamiFormat[1]; //Marine, Land
        location = tsunamiFormat[4]; // BOM regions
    } else if( genericFormat ) {
        eventType = genericFormat[1]; //Earthquake
        category = genericFormat[2]; //Advice
        // subcategory = genericFormat[1]; //Marine, Land
        location = genericFormat[3]; // BOM regions
    } else {
        return;
    }

    return {
        regionString: 'Melbourne Metropolitan (Central)', //hardcoded
        eventType: eventType,
        category: category,
        location: location
    };
}

function findMatchingFeature(srcFeature, matchFeatures) {
    var srcDate = util.parseISODate(srcFeature.properties.created);
    var srcSent = util.parseISODate(srcFeature.properties.sentTime);
    if(!srcDate) {
        return;
    }
    var matches = matchFeatures.filter(function(feature) {
        var date = util.parseISODate(feature.properties.created);
        // console.log(date, srcDate);
        if( date && (srcDate.diff(date) > -1000*60*10) && (srcDate.diff(date) < 1000*60*10) ) {
            return true;
        } else if( date && srcSent && (srcSent.diff(date) > -1000*60*10) && (srcSent.diff(date) < 1000*60*10) ) {
            return true;
        } else {
            return false;
        }
    });
    if( matches.length ) {
        return matches[0];
    }
    return;
}

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.SES_WARNING_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

// transform ses warning feed to geojson
exports.transform = function(data) {
    var seswarninggeojson = [];
    if( data.Messages && data.Messages.Message ) {
        seswarninggeojson = data.Messages.Message.map(function(a) {
            var category = a.attributeMessageCategory ? a.attributeMessageCategory[0] : null,
                eventType = a.attributeEventType ? a.attributeEventType[0] : null,
                location = a.attributeLocation ? a.attributeLocation[0] : null,
                regionString = a.attributeRegion ? a.attributeRegion[0] : null,
                messageId = a.messageId ? a.messageId[0] : null,
                effectiveDate = a.attributeEffectiveDate ? a.attributeEffectiveDate[0] : null,
                serverSentTime = a.serverSentTime ? a.serverSentTime[0] : null,
                webBody = a.webBody ? a.webBody[0] : null,
                subject = a.subject ? a.subject[0] : null;

            if( !category && !eventType && !location && !regionString && a.Subject) {
                var cat = categoriseBySubject(a.Subject[0]);
                if( cat ) {
                    category = cat.category;
                    eventType = cat.eventType;
                    location = cat.location;
                    regionString = cat.regionString;
                } else {
                    log.warn('Unable to categorise warning: '+a.Subject[0]);
                    return;
                }
            }

            if( !category || !category.length ) {
                // set the category to something sensible
                category = 'Advice';
                if( (eventType === 'Severe Weather') || (eventType === 'Severe Thunderstorm') ) {
                    if( subject && subject.indexOf('Cancellation')>=0 ) {
                        category = 'Minor';
                    } else {
                        category = 'Moderate';
                    }
                } else if( eventType === 'Very Dangerous Thunderstorm' ) {
                    category = 'Emergency Warning';
                }
            }

            // incident location:
            var incidentProperties = {
                'feedType': 'incident',
                'category1': eventType,
                'category2': eventType,
                location: location
            };

            return {
                'type': 'Feature',
                'properties': {
                    'feedType': 'warning',
                    'id': messageId,
                    'category1': category,
                    'category2': eventType,
                    'location': regionString,
                    'created': util.parseDate(effectiveDate),
                    'sentTime': util.parseDate(serverSentTime),
                    'incidentFeatures': [{properties: incidentProperties}],
                    'webBody': webBody
                }
            };
        }).filter(function(a) {
            return a !== undefined;
        });
    }
    exports.features = seswarninggeojson;
};

function shortSummary(feature) {
    return [
        feature.properties.feedType,
        feature.properties.created,
        feature.properties.id,
        feature.properties.category1,
        feature.properties.category2
    ].join('/');
}

// integrate feed with ses-ripe and others
exports.integrate = function(datasetsMap, config) {
    var ripe = datasetsMap['ses-ripe'].features;

    exports.features = exports.features.map(function(feature){
        if( ! feature.geometry ) {
            // look up a geom for the feature
            var ripeFeature = findMatchingFeature(feature, ripe);
            if( ripeFeature ) {
                feature.geometry = ripeFeature.geometry;
                log.info('Assigning geometry from feature: ripe/'+shortSummary(ripeFeature)+' to feature: ses/'+shortSummary(feature));
            }
        }
        if( !feature.geometry && feature.properties.location ) { // fall back to location?
            var geom = regionsToGeometry(feature.properties.location);
            if( geom !== undefined ) {
                feature.geometry = geom;

                // hide the polygons associated with the feature
                feature.properties.style = {
                    fill: false,
                    stroke: false
                };
            }
        }
        if( !feature.geometry ) {
            log.warn('Unable to assign a geometry to feature: '+shortSummary(feature));
            return;
        }
        return feature;
    }).filter(function(feature){
        return feature !== undefined;
    });

    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": exports.features
        });
    }
};
