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

    describe("EM-Public Feed Transfer", function() {
        var assert = require('assert');
        var sinon = require('sinon');
        var sandbox, transfer, config;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            delete require.cache[SRC+'/transfer'];
            transfer = require(SRC+'/transfer');
            config = require(SRC+'/config')(configFiles);
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('should run with good xml', function(cb) {
            var callbacks = 0;
            transfer.issueXMLRequest(function(err,data){
                callbacks++;
                if( callbacks === 1 ) {
                    assert(err === null, 'expected no error');
                    cb();
                } else {
                    assert(false, 'ERROR ---- multiple callbacks');
                }
            }, 'file://../test/unit/data/good-xml.xml', 'unit-test/good-xml.xml', {});
        });

        it('should run and recover from recoverable bad xml', function(cb) {
            var callbacks = 0;
            transfer.issueXMLRequest(function(err,data){
                callbacks++;
                if( callbacks === 1 ) {
                    assert(err === null, 'expected no error');
                    cb();
                } else {
                    assert(false, 'ERROR ---- multiple callbacks');
                }
            }, 'file://../test/unit/data/bad-recoverable-xml.xml', 'unit-test/bad-recoverable-xml.xml', {});
        });

        it('should run and fail with bad xml', function(cb) {
            var callbacks = 0;
            transfer.issueXMLRequest(function(err,data){
                callbacks++;
                if( callbacks === 1 ) {
                    assert(err, 'expected error');
                    cb();
                } else {
                    assert(false, 'ERROR ---- multiple callbacks');
                }
            }, 'file://../test/unit/data/bad-xml.xml', 'unit-test/bad-xml.xml', {});
        });

        it('should run with good json', function(cb) {
            var callbacks = 0;
            transfer.issueJSONRequest(function(err,data){
                callbacks++;
                if( callbacks === 1 ) {
                    assert(err === null, 'expected no error');
                    cb();
                } else {
                    assert(false, 'ERROR ---- multiple callbacks');
                }
            }, 'file://../test/unit/data/good-json.json', 'unit-test/good-json.json', {});
        });

        it('should run and fail with bad json', function(cb) {
            var callbacks = 0;
            transfer.issueJSONRequest(function(err,data){
                callbacks++;
                if( callbacks === 1 ) {
                    assert(err, 'expected error');
                    cb();
                } else {
                    assert(false, 'ERROR ---- multiple callbacks');
                }
            }, 'file://../test/unit/data/bad-json.json', 'unit-test/bad-json.json', {});
        });

    });

})();
