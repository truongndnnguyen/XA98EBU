'use strict';

// deps
var async = require('async'),
    transfer = require('./transfer'),
    log = require('./log');

exports.loadDatasets = function(config) {
    return config.DATASETS.map(require);
};

exports.run = function(config, masterCB) {
    config = config || require('./config')();

    // configure logging framework
    log.reset(config);

    console.log(config)
    // load the datasets for processing
    var datasets = exports.loadDatasets(config);
    var datasetsMap = {};
    datasets.map(function(dataset){ datasetsMap[dataset.name] = dataset;});

    // create directories to store intermediate files
    transfer.configure(config);
    transfer.createDirectories(datasets);

    //console.log("########GET FEEDS##########")
    var requestors = {};
    datasets.forEach(function(dataset){
        dataset.status = 'OK';
        if( dataset.issueRequest ) {
            requestors[dataset.name] = function(cb) {
                try {
                    dataset.issueRequest(config, cb);
                } catch(err) {
                    dataset.status = 'ERROR';
                    log.error('Caught while issuing request:', dataset.name, err);
                    return cb(err);
                }
            };
        }
    });
    async.parallel(requestors, function(err, results) {
        if (err) {
            log.error('Caught while fetching all feeds: ', err);
            masterCB(err);
            return;
        }
        log.info('Successfully retrieved all feeds');

        //console.log("######## TRANSFORM ##########")
        // process the individual payloads
        datasets.forEach(function(dataset){
            if( dataset.transform ) {
                try {
                    var resultsData = results[dataset.name];
                    if( resultsData && resultsData.CACHED_RESULT ) {
                        dataset.status = 'WARNING';
                    }
                    dataset.transform(resultsData, results);
                } catch(err) {
                    dataset.status = 'ERROR';
                    log.error('Exception caught while transforming '+dataset.name+': ',err);
                }
            }
        });

        // integrate dependent payloads
        datasets.forEach(function(dataset){
            if( dataset.integrate ) {
                try {
                    dataset.integrate(datasetsMap, config);
                } catch(err) {
                    dataset.status = 'ERROR';
                    log.error('Exception caught while integrating '+dataset.name+': ',err);
                }
            }
        });

        //console.log("######## AGGREGATE ##########")
        // perform aggregation operations across all datasets
        datasets.forEach(function(dataset){
            if( dataset.aggregate ) {
                try {
                    dataset.aggregate(datasets, config);
                } catch(err) {
                    dataset.status = 'ERROR';
                    log.error('Exception caught while aggregating '+dataset.name+': ',err);
                }
            }
        });

        //console.log("########PUBLISH##########")
        //publish the generated data to s3
        var publishers = {};
        datasets.forEach(function(dataset){
            var s3 = dataset.feeds.s3;
            if( s3 ) {
                s3.Bucket = config.S3_BUCKET;
                if( s3.Key.indexOf(config.S3_BUCKET_PATH) !== 0 ) {
                    s3.Key = config.S3_BUCKET_PATH + s3.Key;
                }
                publishers[dataset.name] = function(cb) {
                    transfer.storeResult(dataset.name, s3, cb);
                };
            }
            var s3collection = dataset.feeds.s3collection;
            if( s3collection ) {
                var detailid = 0;
                s3collection.forEach(function(s3){
                    var key = dataset.name + '_' + (detailid++);
                    s3.Bucket = config.S3_BUCKET;
                    if( s3.Key.indexOf(config.S3_BUCKET_PATH) !== 0 ) {
                        s3.Key = config.S3_BUCKET_PATH + s3.Key;
                    }
                    publishers[key] = function(cb) {
                        transfer.storeResult(key, s3, cb);
                    };
                });
            }
            var pubs = dataset.publishers;
            if( pubs ) {
                var publisherid = 0;
                pubs(datasets, config).forEach(function(pub){
                    var key = dataset.name + '_' + (publisherid++);
                    publishers[key] = pub;
                });
            }
        });
        try {
            async.parallel(publishers, function(err, results) {
                if (err) {
                    log.error('Caught while publishing feed results: '+err);
                    masterCB(err);
                } else {
                    log.info('Successfully updated S3 all feeds');
                    masterCB(null,null);
                }
            });
        } catch(err) {
            log.error('Caught exception outside of publisher parallel', err);
            masterCB(err);
        }
    });
};
