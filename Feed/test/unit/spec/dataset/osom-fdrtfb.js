(function() {
    'use strict';

    var SRC = '../../../../src';
    var configFiles = [
        './config/inputs/unit-test.json',
        './config/outputs/unit-test.json'
    ];

    describe("EM-Public Feed OSOM-FDRTFB", function() {
        var assert = require('assert');
        var sinon = require('sinon');
        var sandbox, dataset, config;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            dataset = require(SRC+'/dataset/osom-fdrtfb');
            config = require(SRC+'/config')(configFiles);
        });

        afterEach(function() {
            sandbox.restore();
        });

        function transformData(name, date) {
            delete require.cache['../../data/dataset/osom-fdrtfb/'+name];
            if( date ) {
                var util = require(SRC+'/util');
                sandbox.stub(util, 'currentDate', function(){return date;});
            }
            dataset.transform(require('../../data/dataset/osom-fdrtfb/'+name));
            assert(!dataset.status || dataset.status !== 'ERROR', 'status should not be error');
        }

        it('should transform a good dataset', function() {
            transformData('good');
            assert(!dataset.features || !dataset.features.length, 'should not export any features');
        });

        it('should output a total fire ban for today', function() {
            transformData('tfb', '26/12/2015');
            assert(dataset.features && dataset.features.length, 'should export a feature');
        });

        it('should not output a total fire ban for tomorrow', function() {
            transformData('tfb', '27/12/2015');
            assert(!dataset.features || !dataset.features.length, 'should not export any features');
        });

    });

})();
