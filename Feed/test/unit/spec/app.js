(function() {
    'use strict';

    var SRC = '../../../src';
    var configFiles = [
        './config/inputs/unit-test.json',
        './config/outputs/unit-test.json'
    ];

    function loadDatasetsMockException(interfaceName){
        return function() {
            delete require.cache[require.resolve('../lib/dataset/nop')];
            var dataset = require('../lib/dataset/nop');
            dataset.name = 'exception-'+interfaceName;
            dataset[interfaceName] = function(){
                throw new Error('intentional unit test exception');
            };
            return [dataset];
        };
    };

    describe("EM-Public Feed App", function() {
        var assert = require('assert');
        var sinon = require('sinon');
        var sandbox, app, config;
        var sandboxLoadDatasets;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            app = require(SRC+'/app');
            sandboxLoadDatasets = app.loadDatasets;
            config = require(SRC+'/config')(configFiles);
        });

        afterEach(function() {
            sandbox.restore();
            app.loadDatasets = sandboxLoadDatasets;
        });

        it('app should run with no data sets', function(cb) {
            config.DATASETS = [];
            app.run(config, cb);
        });

        it('app should run with no-operation dataset', function(cb) {
            config.DATASETS = ['../test/unit/lib/dataset/nop'];
            delete require.cache[require.resolve('../lib/dataset/nop')];
            app.run(config, cb);
        });

        it('app should run with dataset erroring during issueRequest', function(cb) {
            app.loadDatasets = function(){
                var nop = require('../lib/dataset/fail-request');
                return [nop];
            };
            app.run(config, function(err,data){
                assert(err, 'expected an error to be returned');
                cb();
            });
        });

        it('app should run with dataset throwing exception during issueRequest', function(cb) {
            app.loadDatasets = loadDatasetsMockException('issueRequest');
            app.run(config, function(err,data){
                assert(err, 'expected an error to be returned');
                cb();
            });
        });

        it('app should run with dataset throwing exception during transform', function(cb) {
            app.loadDatasets = loadDatasetsMockException('transform');
            app.run(config, cb);
        });

        it('app should run with dataset throwing exception during integrate', function(cb) {
            app.loadDatasets = loadDatasetsMockException('integrate');
            app.run(config, cb);
        });

        it('app should run with dataset throwing exception during aggregate', function(cb) {
            app.loadDatasets = loadDatasetsMockException('aggregate');
            app.run(config, cb);
        });

        it('app should run with single s3 data file published', function(cb) {
            config.DATASETS = ['../test/unit/lib/aggregation/single-s3'];
            delete require.cache[require.resolve('../lib/aggregation/single-s3')];
            app.run(config, cb);
        });

        it('app should run with multiple s3 data files published', function(cb) {
            config.DATASETS = ['../test/unit/lib/aggregation/multiple-s3'];
            delete require.cache[require.resolve('../lib/aggregation/multiple-s3')];
            app.run(config, cb);
        });

        it('app should run with working custom publisher', function(cb) {
            config.DATASETS = ['../test/unit/lib/aggregation/publisher-ok'];
            delete require.cache[require.resolve('../lib/aggregation/publisher-ok')];
            app.run(config, cb);
        });

        it('app should run with broken custom publisher (exception)', function(cb) {
            config.DATASETS = ['../test/unit/lib/aggregation/publisher-exception'];
            delete require.cache[require.resolve('../lib/aggregation/publisher-exception')];
            app.run(config, function(err){
                assert(err, 'expecting an error to be raised');
                cb();
            });
        });

    });

})();
