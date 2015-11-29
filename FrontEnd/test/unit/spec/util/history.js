(function() {
    'use strict';

    describe("EM-Public Util History", function() {
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        before(function() {
            util.history.setFlag('');
        });

        it('should not have flag set', function() {
            expect(util.history.getFlag('textonly')).to.be.false;
        });

        it('should set flag', function() {
            util.history.setFlag('textonly');
            expect(util.history.getFlag('textonly')).to.be.true;
        });

        it('should not have path set', function() {
            expect(util.history.getPath()).to.be.null;
        });

        it('should set path', function() {
            util.history.setPath('/incident/123');
            expect(util.history.getPath()).to.equal('/incident/123');
        });

        it('should clear path if set', function() {
            util.history.setPath('/incident/123');
            util.history.clearPath();
            expect(util.history.hasPath()).to.be.false;
        });

        it('should clear path if not set', function() {
            util.history.setPath('/incident/123');
            util.history.clearPath();
            util.history.clearPath();
            expect(util.history.hasPath()).to.be.false;
        });

    });
})();
