(function() {
  'use strict';

  describe("EM-Public App UI Selection", function() {

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
            fire: function(){},
            locateMe: {
                isActive: function() {}
            }
        };
        var controller = {
            getLayer: function(){return layer;}
        };

        sandbox.stub(app.data, 'visitAllLayers', function(cb) {
            cb({
                feature: {
                    classification: {
                        deeplinkurl: 'safer-place/123'
                    }
                }
            });
        });

        sandbox.stub(app.ui.popup, 'openPopup');
        sandbox.stub(app.ui.sidebar, 'highlightPanel');
        sandbox.stub(app.data.controllers, 'map', function(cb){return [controller].map(cb);});
        sandbox.stub(L, 'stamp', function(){return 'ID';});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('init should run', function() {
        app.ui.selection.init();
    });

    it('should select a feature', function() {
        sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.select(feature);
    });

    it('should not reselect an already selected feature', function() {
        sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.select(feature);
        app.ui.selection.select(feature);
    });

    it('should toggle selected feature', function() {
        sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.toggle(feature);
        app.ui.selection.toggle(feature);
    });

    it('should reselect feature', function() {
        sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.toggle(feature);
        app.ui.selection.reselect();
        app.ui.selection.toggle(feature);
        app.ui.selection.reselect();
    });

    it('should select a feature layer by deeplink url', function() {
        var selectFeature = sandbox.stub(app.ui.selection, 'select');
        var zoomToFeature = sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.selectByDeeplinkURL('safer-place/123');
        expect(selectFeature).to.be.called.once;
        // expect(zoomToFeature).to.be.called.once;
    });

    it('should select a feature layer by deeplink url with super path search', function() {
        var selectFeature = sandbox.stub(app.ui.selection, 'select');
        var zoomToFeature = sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.selectByDeeplinkURL('safer-place/123/otherpath/321');
        expect(selectFeature).to.be.called.once;
        // expect(zoomToFeature).to.be.called.once;
    });

    it('should open more info modal by deeplink url with super path search with more info', function() {
        var selectFeature = sandbox.stub(app.ui.selection, 'select');
        var moreInfoDeeplinkURL = sandbox.stub(app.ui.selection, 'moreInfoDeeplinkURL');
        app.ui.selection.selectByDeeplinkURL('safer-place/123/otherpath/321/moreinfo');
        expect(selectFeature).to.be.called.once;
        expect(moreInfoDeeplinkURL).to.be.called.once;
    });

    it('should alert the user if cannot find a feature layer by deeplink url', function() {
        var selectFeature = sandbox.stub(app.ui.selection, 'select');
        var zoomToFeature = sandbox.stub(app.ui, 'zoomToFeature');
        app.ui.selection.selectByDeeplinkURL('safer-place/NOTFOUND');
        expect(selectFeature).to.not.be.called
        expect(zoomToFeature).to.not.be.called;
    });

    it('should remember last spiderfy cluster', function() {
        var layer = {};
        layer.spiderfyClusteredPopup = function(){ return layer; };
        layer.unspiderfy = function(){};
        app.ui.selection.spiderfyLayer(layer);
    });

    it('should clear last spiderfy cluster', function() {
        var layer = {};
        layer.spiderfyClusteredPopup = function(){ return layer; };
        layer.unspiderfy = function(){};

        app.ui.selection.spiderfyLayer(layer);
        app.ui.selection.clearSpiderfy();
    });

  });
})();
