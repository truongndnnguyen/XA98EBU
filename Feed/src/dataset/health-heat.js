var transfer = require('../transfer'),
    util = require('../util'),
    log = require('../log'),
    regions = require('../../config/reference/bom-regions-simplified-with-points.json'),
    handlebars = require('handlebars'),
    fs = require('fs'),
    helpers = require('../handlebars-helper');

// register helpers
helpers.register(handlebars);

// create input and output directories to store intermediate files
exports.name = 'health-heat';
exports.description = 'Health.VIC Heat Health Alert System';
exports.category = 'health';
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

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.HEALTH_HEAT_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

// transform heat health warning feed to geojson
exports.transform = function(data) {
    exports.features = [];

    if( data.data && data.data.alerts && data.data.alerts[0].type && data.data.alerts[0].type.length ) {
        var today = util.currentDate('YYYY-MM-DD'),
            meta = data.data.meta ? data.data.meta[0] : null,
            date = meta && meta.date ? meta.date[0] : null,
            contentApprover = meta && meta.contentapprover ? meta.contentapprover[0] : null,
            forecast = date && date.forecast ? date.forecast[0] : null,
            created = date && date.created ? date.created[0] : null;

        var templateSource = fs.readFileSync('config/templates/health-heat-html.hbs').toString();
        var template = handlebars.compile(templateSource);

        exports.features = data.data.alerts[0].type.filter(function(alertType){
            return alertType.$.declaration && alertType.$.declaration === 'community declaration';
            // return alertType.$.declaration && alertType.$.declaration === 'sector declaration';
        }).map(function(alertType){
            var alertDates = alertType.date.filter(function(alert){
                return alert.$.id && alert.$.id === today;
            });
            if( ! alertDates.length ) {
                return null;
            }

            var a = alertDates[0],
                webBody = null, // replace with handlebar output
                regionString = null, // replace with region created from district list
                geometry = null; // replace with matched polygon geometry

            var regionMap = {};
            var districts = a.district.map(function(f){
                if( f.name ) {
                    var code = f.id[0], name = f.name[0];
                    var match = code.match(/^BOM(\d+)$/);
                    if( match && match.length === 2 ) {
                        code = 'VIC_FW0' + (match[1]<10 ? '0' : '') + match[1];
                    }
                    regionMap[code] = name;
                    return name;
                }
                return null;
            }).filter(function(f){
                return f !== null;
            });
            regionString = districts.join(', ');

            var geoms = regions.features.filter(function(f){
                return f.properties.AAC && regionMap[f.properties.AAC];
            }).map(function(f){
                return f.geometry;
            });

            var incidentProperties = {
                'feedType': 'incident',
                'category1': 'Health',
                'category2': 'Heat Health Alert'
                // location: regionString
            };

            webBody = template({
                regionString: regionString,
                districts: districts,
                forecast: forecast,
                today: new Date().toISOString(),
                contentApprover: contentApprover
            });

            return {
                'type': 'Feature',
                'geometry': {
                    'type': 'GeometryCollection',
                    'geometries': geoms
                },
                'properties': {
                    'feedType': 'warning',
                    'id': a.id,
                    'category1': 'Advice',
                    'category2': 'Heat Health',
                    'location': regionString,
                    'created': forecast,
                    'webBody': webBody,
                    'incidentFeatures': [{properties: incidentProperties}]
                }
            };
        }).filter(function(f){ return f !== null; });
    }
};
