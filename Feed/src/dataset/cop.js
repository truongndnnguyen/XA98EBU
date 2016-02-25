var transfer = require('../transfer'),
    log = require('../log'),
    async = require('async');

// create input and output directories to store intermediate files
exports.name = 'major-incident';
exports.description = 'EM-COP major incident pages';
exports.category = 'cop';
exports.feeds = {
    // s3: {
    //     Key: 'osom-burn-area-geojson.json',
    //     ContentType: 'application/json',
    //     Body: {}
    // },
    statusPage: true,
    firehose: false,
    localview: false,
    textonly: false,
    cap: false,
    relief: true
};
exports.features = [];
exports.datafiles = {};
var copEndpoint = null;

function requestGeoJSONFiles(cb, data) {

    var requestors = {};

    var copFeedGeoJSON = data;
    var publicUrl = copEndpoint + '/public/';
    publicUrl = publicUrl.replace('http://', 'http://public-info.');

    // adjustments needed to url for sample data.
    if(copEndpoint.indexOf('file') === 0) {
        publicUrl = copEndpoint.substring(0, copEndpoint.lastIndexOf("/")+1);
    }

    copFeedGeoJSON.features.forEach(function(d) {
        if( d.properties && d.properties.publicroomid ) {
            requestors[d.properties.publicroomid] = function(cbx) {
                transfer.issueJSONRequest(cbx, publicUrl + d.properties.publicroomid + '-geojson.json',
                    exports.category+'/'+exports.name+'-'+d.properties.publicroomid+'.json', {ignore404:true});
            };
        }
    });

    async.parallel(requestors, function(err, results) {
        if (err) {
            log.error('Caught during COP GeoJSON feed fetch: '+JSON.stringify(err));
            cb(err, data);
            exports.status = 'ERROR';
            return;
        }

        log.info('Successfully retrieved COP GeoJSON feeds');

        exports.datafiles = results

        cb(null, data);
    });
}

exports.issueRequest = function(config, cb) {
    exports.datafiles = {};
    copEndpoint = config.COP_ENDPOINT;

    var url = copEndpoint + '/map/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=nics.collaborationfeed:published_incident_room&maxFeatures=5000&outputFormat=application/json';

    if(copEndpoint.indexOf('file') === 0) {
        url = copEndpoint;
    }

    transfer.issueJSONRequest(function(err,data) {
        if(err) {
            return cb(err);
        } else {
            return requestGeoJSONFiles(cb, data);
        }
    }, url, exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var copFeedGeoJSON = data;
    var publicUrl = copEndpoint + '/public/';
    publicUrl = publicUrl.replace('http://', 'http://public-info.');

    copFeedGeoJSON.features.forEach(function(d) {
        delete d.geometry_name;
        delete d.id;
        d.properties = {
            feedType: 'public-info',
            category1: d.properties.incidentstage,
            created: d.properties.publishdate, //iso date time
            updated: d.properties.lastupdate, //iso date time
            location: d.properties.location,
            name: d.properties.publicname || d.properties.incidentname,
            id: d.properties.publicroomid,
            incidentexternalref: d.properties.incidentexternalref,
            incidentinternalref: d.properties.incidentid,
            url: publicUrl + d.properties.publicroomid + '.html',
            publicroomid:d.properties.publicroomid 
        };

        // icon: 'public-info',
        // style: {
        //     color: '#0000FF',
        //     opacity: 1.0,
        //     fillColor: '#0000ff',
        //     fillOpacity: 0.3,
        //     stroke: true,
        //     weight: 3
        // }
    });
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = data;
    }
    exports.features = copFeedGeoJSON.features;
};

// integrate feed events with OSOM Incidents and OSOM Warnings
exports.integrate = function(datasetsMap, config) {
    var incidents = datasetsMap['osom-incident'].features || [],
        warnings = datasetsMap['osom-warning'].features || [],
        capwarnings = datasetsMap['osom-cap-warning'].features || [],
        publicInfos = {};

    exports.features.forEach(function(event) {
        if( event.properties.incidentexternalref ) {
            publicInfos[event.properties.incidentexternalref] = event;
        }
    });

    incidents.forEach(function(event) {
        if( publicInfos[event.properties.id] ) {
            event.properties.majorIncidentId = publicInfos[event.properties.id].properties.publicroomid;
        }
    });

    warnings.forEach(function(event) {
        if( publicInfos[event.properties.id] ) {
            event.properties.majorIncidentId = publicInfos[event.properties.id].properties.publicroomid;
        }
        if( event.properties.incidentList && event.properties.incidentList.length ) {
            var id = event.properties.incidentList[0].id;
            if( publicInfos[id] ) {
                event.properties.majorIncidentId = publicInfos[id].properties.publicroomid;
            }
        }
    });

    capwarnings.forEach(function(event) {
        if( publicInfos[event.properties.id] ) {
            event.properties.majorIncidentId = publicInfos[event.properties.id].properties.publicroomid;
        }
        if( event.properties.incidentList && event.properties.incidentList.length ) {
            var id = event.properties.incidentList[0].id;
            if( publicInfos[id] ) {
                event.properties.majorIncidentId = publicInfos[id].properties.publicroomid;
            }
        }
    });
};
