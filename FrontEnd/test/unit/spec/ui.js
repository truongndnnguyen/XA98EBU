(function() {
  'use strict';

  describe("EM-Public App UI", function() {

    var sandbox, feature;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        var layer = {
            spiderfyClusteredPopup: function(){}
        };
        feature = {
            classification: {
                deeplinkurl: 'deeplink'
            },
            geometry: {
                'type': 'Point'
            },
            layer: {
            }
        };
        app.map = {
            invalidateSize: function(){},
            closePopup: function(){},
            setView: function(){},
            fire: function(){}
        };
        var controller = {
            getLayer: function(){return layer;}
        };

        sandbox.stub(app.ui.popup, 'openPopup');
        sandbox.stub(app.ui.sidebar, 'highlightPanel');
        sandbox.stub(app.data.controllers, 'map', function(cb){return [controller].map(cb);});
        sandbox.stub(L, 'stamp', function(){return 'ID';});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('init should run', function() {
        var alertInit = sandbox.stub(app.ui.alert,'init');
        var searchInit = sandbox.stub(app.ui.search,'init');
        var sidebarInit = sandbox.stub(app.ui.sidebar,'init');
        var filterInit = sandbox.stub(app.ui.filter,'init');
        var locateMeInit = sandbox.stub(app.ui.locateMe,'init');
        var layoutInit = sandbox.stub(app.ui.layout,'init');
        var popupInit = sandbox.stub(app.ui.popup,'init');


        app.ui.init(true);

        expect(alertInit.called).to.be.true;
        expect(searchInit.called).to.be.true;
        expect(sidebarInit.called).to.be.true;
        expect(layoutInit.called).to.be.true;
        expect(popupInit.called).to.be.true;
    });

    it('should zoom to feature', function(){
        app.ui.zoomToFeature(feature);
    });

  });
})();
