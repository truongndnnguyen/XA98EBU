(function() {
    'use strict';

    describe("EM-Public Util Feature", function() {
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should use default settings', function() {
            util.feature.init({'defon':true, 'defoff':false});
            expect(util.feature.toggles.defon).to.be.true;
            expect(util.feature.toggles.defoff).to.be.false;
        });

        it('should set feature on/off', function() {
            util.feature.init();
            util.feature.set('defon', true);
            util.feature.set('defoff', false);
            expect(util.feature.toggles.defon).to.be.true;
            expect(util.feature.toggles.defoff).to.be.false;
        });

        it('should process query values on', function() {
            util.feature.init();
            util.feature.processQueryArgs('?ft=defon&ft-off=defoff', 'ft', true);
            expect(util.feature.toggles.defon).to.be.true;
        });

        it('should process query values off', function() {
            util.feature.init();
            util.feature.processQueryArgs('?ft=defon&ft-off=defoff', 'ft-off', false);
            expect(util.feature.toggles.defoff).to.be.false;
        });

        it('should process negated query values', function() {
            util.feature.init();
            util.feature.processQueryArgs('?ft=defon,!defoff', 'ft', true);
            expect(util.feature.toggles.defon).to.be.true;
            expect(util.feature.toggles.defoff).to.be.false;
        });

    });
})();
