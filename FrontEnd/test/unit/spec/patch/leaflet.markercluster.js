(function() {
    'use strict';

    describe("EM-Public Patch Leaflet.MarkerCluster", function() {

        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should always spiderfy coincident markers', function() {
            var layer = {
                layers: [
                    {getLatLng: function() { return {_latlng: [1,2], distanceTo: function(){ return 0; }}}},
                    {getLatLng: function() { return {_latlng: [1,2], distanceTo: function(){ return 0; }}}}
                ],
                getAllChildMarkers: function() { return this.layers; },
            };
            expect(L.MarkerClusterGroup.prototype._alwaysSpiderfyCluster(layer)).to.be.true;
        });

        it('should not always spiderfy non-coincident markers', function() {
            var layer = {
                layers: [
                    {getLatLng: function() { return {_latlng: [1,2], distanceTo: function(){ return 1; }}}},
                    {getLatLng: function() { return {_latlng: [1,2], distanceTo: function(){ return 1; }}}}
                ],
                getAllChildMarkers: function() { return this.layers; },
            };
            expect(L.MarkerClusterGroup.prototype._alwaysSpiderfyCluster(layer)).to.be.false;
        });

        it('should not always spiderfy single markers', function() {
            var layer = {
                layers: [
                    {getLatLng: function() { return {_latlng: [1,2], distanceTo: function(){ return 1; }}}}
                ],
                getAllChildMarkers: function() { return this.layers; },
            };
            expect(L.MarkerClusterGroup.prototype._alwaysSpiderfyCluster(layer)).to.be.false;
        });

        it('should not always spiderfy empty sets of markers', function() {
            var layer = {
                layers: [],
                getAllChildMarkers: function() { return this.layers; },
            };
            expect(L.MarkerClusterGroup.prototype._alwaysSpiderfyCluster(layer)).to.be.false;
        });

        it('should check for always spiderfy when zoomOrSpiderfyCluster, default behaviour when false', function() {
            var layer = {
                _zoomOrSpiderfySuper: function(){},
                _alwaysSpiderfyCluster: function(){},
                _map: { _container: { focus: function(){} } },
                options: {spiderfyOnMaxZoom: true}
            };
            var e = {
                layer: layer,
                originalEvent: {keyCode: 13}
            }
            var alwaysStub = sandbox.stub(layer, '_alwaysSpiderfyCluster', function(){return false;});
            var superStub = sandbox.stub(layer, '_zoomOrSpiderfySuper');
            L.MarkerClusterGroup.prototype._zoomOrSpiderfy.call(layer,e);
            expect(superStub).to.be.called.once;
            expect(alwaysStub).to.be.called.once;
        });

        it('should check for always spiderfy when zoomOrSpiderfyCluster, spiderfy behaviour when true', function() {
            var layer = {
                _zoomOrSpiderfySuper: function(){},
                _alwaysSpiderfyCluster: function(){},
                _map: { _container: { focus: function(){} } },
                spiderfy: function(){},
                options: {spiderfyOnMaxZoom: true}
            };
            var e = {
                layer: layer,
                originalEvent: {keyCode: 13}
            }
            var alwaysStub = sandbox.stub(layer, '_alwaysSpiderfyCluster', function(){return true;});
            var superStub = sandbox.stub(layer, '_zoomOrSpiderfySuper');
            var spiderfyStub = sandbox.stub(layer, 'spiderfy');
            L.MarkerClusterGroup.prototype._zoomOrSpiderfy.call(layer,e);
            expect(superStub).to.not.be.called;
            expect(alwaysStub).to.be.called.once;
            expect(spiderfyStub).to.be.called.once;
        });

        it('should spiderfy group when in a cluster', function() {
            var root = {
                spiderfy: function(){}
            };
            var marker = {
                _map: null,
                __parent: {
                    _group: {
                        getVisibleParent: function() { return root; }
                    }
                },
                getPopup: function(){ return {getContent: function() { return 'html'; }}},
                fire: function() {}
            };
            var rootSpiderfy = sandbox.stub(root,'spiderfy');

            L.Marker.prototype.spiderfyClusteredPopup.call(marker);
            expect(rootSpiderfy).to.be.called.once;
        });

    });
})();
