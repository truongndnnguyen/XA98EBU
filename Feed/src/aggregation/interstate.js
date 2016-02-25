var transfer = require('../transfer');

// create input and output directories to store intermediate files
exports.name = 'interstate';
exports.description = 'Interstate incidents and warnings';
exports.category = 'interstate';
exports.feeds = {
    s3: {
        Key: 'interstate-geojson.json',
        ContentType: 'application/json',
        ContentEncoding: 'gzip',
        Body: {}
    }
};

exports.issueRequest = null;

// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets) {
    var features = [];
    datasets.forEach(function(dataset){
        if( dataset.feeds.interstate === true ) {
            features = features.concat(dataset.features);
        }
    });

    // transform feed to geojson
    exports.feeds.s3.Body = JSON.stringify({
        "type": "FeatureCollection",
        "features": features
    });
};
