(function() {
  'use strict';

  describe("EM-Public Data", function() {

    var sandbox;
    var controllers;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        controllers = app.data.controllers;
        app.data.controllers = [];
    });

    afterEach(function () {
        sandbox.restore();
        app.data.controllers = controllers;
    });

    it('init should run', function() {
        var controllers = app.data.controllers;
        app.data.controllers.push({
            init: function(){}
        });
        var init = sandbox.stub(app.data.controllers[0], 'init');
        sandbox.stub(app.data, 'setDataLayerVisibility');

        app.data.init();
        expect(init).to.be.called.once;
    });

    it('should refresh all data sets', function() {
        var controllers = app.data.controllers;
        app.data.controllers.push({
            refreshData: function(){}
        });
        var refresh = sandbox.stub(app.data.controllers[0], 'refreshData');
        var setTO = sandbox.stub(window, 'setTimeout', function(cb){cb();});
        app.data.refresh();
        expect(refresh).to.be.called.once;
    });

    it('should clear old timeouts before refresh', function() {
        var controllers = app.data.controllers;
        app.data.controllers.push({
            timeout: 'TIMEOUT',
            refreshData: function(){}
        });
        var clearTO = sandbox.stub(window, 'clearTimeout');
        var refresh = sandbox.stub(app.data.controllers[0], 'refreshData');
        app.data.refresh();
        expect(clearTO).to.be.called.once;
    });

    it('should reset refresh timer on demand', function() {
        var controllers = app.data.controllers;
        app.data.controllers.push({
            timeout: 'TIMEOUT',
            refreshData: function(callback){ }
        });
        var clearTO = sandbox.stub(window, 'clearTimeout');
        app.data.clearControllerTimeout(controllers[0]);
        expect(clearTO).to.be.called.once;
    });

    it('should not reset refresh timer if there is no refreshData function', function() {
        var controllers = app.data.controllers;
        app.data.controllers.push({});
        var clearTO = sandbox.stub(window, 'clearTimeout');
        var setTO = sandbox.stub(window, 'setTimeout', function(cb){cb();});
        app.data.refreshController(controllers[0]);
        expect(setTO).to.not.be.called;
    });

    it('should set datalayer visibility on all controllers', function() {
        app.data.controllers = [{
            getLayerForFilter: function() {}
        }];
        var dlv = sandbox.stub(app.data.controllers[0], 'getLayerForFilter', function(){ return null; });
        app.data.setDataLayerVisibility('layer',true);
        expect(dlv).to.be.called.once;
    });

    it('should remove invisible controllers', function() {
        app.data.controllers = [{
            getLayerForFilter: function(){ return 'LAYER'; }
        }];
        app.map = {
            addLayer: function(){},
            removeLayer: function(){}
        };
        var addLayer = sandbox.stub(app.map, 'addLayer');
        var removeLayer = sandbox.stub(app.map, 'removeLayer');
        app.data.setDataLayerVisibility('layer',false);
        expect(addLayer).to.not.be.called;
        expect(removeLayer).to.be.called.once;
    });

    it('should remove invisible controllers', function() {
        app.data.controllers = [{
            getLayerForFilter: function(){ return 'LAYER'; }
        }];
        app.map = {
            addLayer: function(){},
            removeLayer: function(){}
        };
        var addLayer = sandbox.stub(app.map, 'addLayer');
        var removeLayer = sandbox.stub(app.map, 'removeLayer');
        app.data.setDataLayerVisibility('layer',true);
        expect(removeLayer).to.not.be.called;
        expect(addLayer).to.be.called.once;
    });

    var visitAllLayers = function(layer, visible) {
        var layerGroup = {
            eachLayer: function(f) { f(layer); }
        };
        app.data.controllers = [{
            getDataLayers: function() {
                return [layerGroup];
            }
        }];
        var visitor = {
            visit: function(layer) {}
        };
        var visit = sandbox.stub(visitor, 'visit');

        app.map = {
            contains: function() { return visible; },
            intersects: function() { return visible; },
            getBounds: function() { return app.map; }
        };

        app.data.visitAllLayers(visitor.visit, visitor);

        return visit;
    };

    it('should visit data layers on all layers', function() {
        var visitorStub = visitAllLayers({
            feature: { classification: { categories: ['category'] } },
            getLatLng: function() { return 'latlng'; }
        }, true);
        expect(visitorStub).to.be.called.once;
    });

    var visit = function(layer, visible) {
        var layerGroup = {
            eachLayer: function(f) { f(layer); }
        };
        app.data.controllers = [{
            getVisibleDataLayers: function() {
                return [layerGroup];
            }
        }];
        var visitor = {
            visit: function(layer) {}
        };
        var visit = sandbox.stub(visitor, 'visit');

        app.map = {
            contains: function() { return visible; },
            intersects: function() { return visible; },
            getBounds: function() { return app.map; }
        };

        app.data.visitVisibleLayers(visitor.visit, visitor);

        return visit;
    };

    it('should visit data layers on all visible controllers by latlng', function() {
        var visitorStub = visit({
            feature: { classification: { categories: ['category'] } },
            getLatLng: function() { return 'latlng'; }
        }, true);
        expect(visitorStub).to.be.called.once;
    });

    it('should visit data layers on all visible controllers by bounds', function() {
        var visitorStub = visit({
            feature: { classification: { categories: ['category'] } },
            getBounds: function() { return {getCenter:function(){return 'center'}}; }
        }, true);
        expect(visitorStub).to.be.called.once;
    });

    it('should not visit data layers on all invisible controllers by latlng', function() {
        var visitorStub = visit({
            feature: { classification: { categories: ['category'] } },
            getLatLng: function() { return 'latlng'; }
        }, false);
        expect(visitorStub).to.not.be.called;
    });

    it('should not visit data layers on all invisible controllers by bounds', function() {
        var visitorStub = visit({
            feature: { classification: { categories: ['category'] } },
            getBounds: function() { return {getCenter:function(){return 'center'}}; }
        }, false);
        expect(visitorStub).to.not.be.called;
    });

    it('should create an icon for a cluster', function() {
        sandbox.stub(L, 'divIcon', function(opts){ return opts; });
        sandbox.stub(util.symbology, 'getIcon', function(ic){ return ic; });

        var markers = [
            {
                options: {zIndexOffset:0},
                defaultOptions: {icon: {options: {iconClass:'class0'}}}
            },
            {
                options: {zIndexOffset:3},
                defaultOptions: {icon: {options: {iconClass:'class3'}}}
            },
            {
                options: {zIndexOffset:3},
                defaultOptions: {icon: {options: {iconClass:'class3'}}}
            },
            {
                options: {zIndexOffset:1},
                defaultOptions: {icon: {options: {iconClass:'class1'}}}
            }
        ];
        var cluster = {
            getAllChildMarkers: function(){ return markers; },
            setZIndexOffset: function(z){ this.zIndexOffset = z; },
            options: {}
        };
        var icon = app.data.createIconForCluster(cluster);
        expect(icon.html).to.equal('class3');
    });

  });
})();
