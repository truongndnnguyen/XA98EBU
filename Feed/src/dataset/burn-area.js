var transfer = require('../transfer');

// create input and output directories to store intermediate files
exports.name = 'burn-area';
exports.description = 'Fire/Incident perimeters representing burned areas';
exports.category = 'burn-area';
exports.feeds = {
    // s3: {
    //     Key: 'osom-burn-area-geojson.json',
    //     ContentType: 'application/json',
    //     Body: {}
    // },
    statusPage: true,
    firehose: true,
    localview: true,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    var burnAreaEndpoint = config.BURN_AREA_ENDPOINT || config.OSOM_ENDPOINT;
    transfer.issueJSONRequest(cb, burnAreaEndpoint, exports.category+'/'+exports.name+'.json');
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var burnAreaFeedGeoJSON = data;
    burnAreaFeedGeoJSON.features.forEach(function(f) {
        f.properties = {
            feedType: 'burn-area',
            cssClass: 'burn-area',
            category1: 'Burn Area',
            created: f.properties.plotTime, //iso date time
            updated: f.properties.plotUpdated, //iso date time
            location: f.properties.centroidLocality,
            name: f.properties.fireName,
            id: f.properties.plotTime
        };
    });
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = data;
    }
    exports.features = burnAreaFeedGeoJSON.features;
};
