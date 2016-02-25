var transfer = require('../transfer'),
    util = require('../util'),
    turf = require('turf'),
    log = require('../log'),
    incidentRules = require('../ruleset/incidents');

// create input and output directories to store intermediate files
exports.name = 'osom-cap-warning';
exports.description = 'Combined MFB, CFA, and DELWP warnings feed';
exports.category = 'osom';
exports.feeds = {
    // s3: {
    //     Key: 'osom-warnings-geojson.json',
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
    transfer.issueOSOMRequest(cb, config, 'getCapWarningFeed', exports.category+'/'+exports.name+'.json');
};

function capToGeometry(info) {
    var geometries = info.area.map(function(area) {
        if (area.circle !== undefined && area.areaDesc !== 'Point_Of_Origin') {
            return {
                'type': 'Point',
                'coordinates': area.circle[0].split(/ /)[0].split(/,/).reverse().map(function(val){return parseFloat(val);})
            };
        } else if (area.polygon !== undefined) {
            return {
                'type': 'Polygon',
                'coordinates': [area.polygon[0].split(/ /).map(function(f) {
                    return f.split(/,/).reverse().map(function(val){return parseFloat(val);});
                })]
            };
        }
    }).filter(function(geom) {
        return geom !== undefined;
    });

    return {
        'type': 'GeometryCollection',
        'geometries': geometries
    };
}

function addCenterPointIfPolygon(geometry) {
    if( geometry.type === 'GeometryCollection' ) {
        var nonPoints = geometry.geometries.filter(function(geom){
            return geom.type !== 'Point';
        });
        if( nonPoints && nonPoints.length ) {
            var features = turf.featurecollection(nonPoints.map(function(geom){
                return {
                    type: 'Feature',
                    geometry: geom
                };
            }));
            var center = turf.center(features);
            geometry.geometries = nonPoints.concat(center.geometry);
        }
    }
    return geometry;
}

// transform feed to geojson features and set the s3 payload
exports.transform = function(data, otherDatasets) {
    var capFeedJson = data;
    var warningFeedJson = otherDatasets['osom-warning'];

    //clean up data first
    capFeedJson.alerts.forEach(function(a) {
        delete a.code;
        a.info.forEach(function(i) {
            delete i.description;
            delete i.eventCode;
            delete i.instruction;
            delete i.language;
            delete i.parameter;
            i.area.forEach(function(ar) {
                delete ar.geocode;
            });
        });
    });

    // transform warnings feed to geojson
    var capFeedGeoJSON = capFeedJson.alerts.map(function(a) {
        var wItem = warningFeedJson.results.filter(function(r) {
            return r.identifier === a.identifier;
        });
        if (wItem.length > 0) {
            var geometry = capToGeometry(a.info[0]);
            try {
                geometry = addCenterPointIfPolygon(geometry);
            } catch(err) {
                log.warn('Ignoring exception when adding center point to polygon in '+exports.name, err);
                exports.status = 'WARNING';
            }

            var msgCategory = wItem[0].msgCategory;
            if (msgCategory === 'WatchAndAct') {
                msgCategory = 'Watch and Act';
            } else if (msgCategory === 'Advice') {
                msgCategory = 'Advice';
            } else if (msgCategory === 'CommunityUpdate') {
                msgCategory = 'Community Update';
            } else if (msgCategory === 'EmergencyWarning') {
                msgCategory = 'Emergency Warning';
            } else if (msgCategory === 'RecommendationtoEvacuate') {
                msgCategory = 'Recommendation to Evacuate';
            }

            var incidentList = wItem[0].incidentList.map(function(il) {
                return {
                    id: il.incidentNo
                };
            });

            var locationList = wItem[0].locationList.map(function(ll){
                return ll.name;
            }).join(', ');

            // //incident location:
            var incidentProperties = {
                'feedType': 'incident',
                'category1': wItem[0].category,
                'category2': wItem[0].category, //eventCode === 'bushFire' etc
                location: wItem[0].location
            };

            var properties = {
                feedType: wItem[0].feedType,
                category1: msgCategory,
                category2: wItem[0].category,
                created: util.parseDate(wItem[0].effectiveDate), //"16/03/15 09:50:00 AM",
                cssClass: wItem[0].msgCatgCssClass,
                webBody: wItem[0].webBody,
                id: wItem[0].identifier,
                incidentList: incidentList,
                location: locationList,
                incidentFeatures: [{properties: incidentProperties}],
                updated: null
            };

            return {
                'type': 'Feature',
                'geometry': geometry,
                'properties': properties
            };
        }
    }).filter(function(a) {
        return a !== undefined;
    }).map(
        incidentRules.transform
    ).filter(function(a) {
        return a !== undefined;
    });

    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": capFeedGeoJSON
        });
    }

    exports.features = capFeedGeoJSON;
};
