var xml2jsProcessors = require('xml2js').processors,
    xml2js = new require('xml2js').Parser({tagNameProcessors : [xml2jsProcessors.stripPrefix]}),
    fs = require('fs');

(function() {
    'use strict';

    var SRC = '../../../../src';
    var configFiles = [
        './config/inputs/unit-test.json',
        './config/outputs/unit-test.json'
    ];

    describe("EM-Public Feed CFS-Incident", function() {
        var assert = require('assert');
        var sinon = require('sinon');
        var sandbox, dataset, config;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            dataset = require(SRC+'/dataset/cfs-incident');
            config = require(SRC+'/config')(configFiles);
        });

        afterEach(function() {
            sandbox.restore();
        });

        function transformData(name, cb) {
            var data = fs.readFileSync('./test/unit/data/dataset/cfs-incident/'+name+'.xml');
            xml2js.parseString(data, function(err,xml) {
                dataset.transform(xml);
                assert(!dataset.status || dataset.status !== 'ERROR', 'status should not be error');
                cb(err,xml);
            });
        }

        it('should transform an empty dataset', function(cb) {
            transformData('empty', function(err,data) {
                assert(!dataset.features || !dataset.features.length, 'should not export any features');
                cb();
            });
        });

        it('should transform a good dataset', function(cb) {
            transformData('single', function(err,data) {
                assert(dataset.features && dataset.features.length === 1, 'should export 1 feature');
                cb();
            });
        });

    });

})();
