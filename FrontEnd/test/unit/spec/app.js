'use strict';

(function() {
    describe("EM-Public App", function() {

        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('init should run', function() {
            var initMap_stub = sandbox.stub(app,'initMap');
            var uiInit = sandbox.stub(app.ui,'init');
            var dataInit = sandbox.stub(app.data,'init');

            app.init();

            // expect(initMap_stub.called).to.be.true;
            expect(uiInit.called).to.be.true;
            // expect(dataInit.called).to.be.true;
        });
    });
})();
