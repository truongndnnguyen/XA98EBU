(function() {
    'use strict';

    var SRC = '../../../src';
    var configFiles = [
        './config/inputs/unit-test.json',
        './config/outputs/unit-test.json'
    ];

    describe("EM-Public Feed Log", function() {
        var assert = require('assert');
        var sinon = require('sinon');
        var sandbox, log, consoleLog, config;
        var sandboxLoadDatasets;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();
            log = require(SRC+'/log');
            consoleLog = sandbox.stub(log, 'msg');
            log.reset({
                LOGGING: {
                    CONSOLE: true
                }
            });
        });

        afterEach(function() {
            sandbox.restore();
        });

        it('should emit a warning with WARN prefix', function() {
            log.warn('test');
            assert(consoleLog.calledWith('WARN'));
        });

        it('should emit a warning with INFO prefix', function() {
            log.info('test');
            assert(consoleLog.calledWith('INFO'));
        });

        it('should emit a warning with ERROR prefix', function() {
            log.error('test');
            assert(consoleLog.calledWith('ERROR'));
        });

        it('should emit a warning with ERROR prefix from err()', function() {
            log.err('test');
            assert(consoleLog.calledWith('ERROR'));
        });

    });

})();
