'use strict';

/* globals L: false */

/*
    Fixes the spiderfy behaviour of Leaflet.MarkerCluster when the points in the cluster are
    located at the exact same coordinates.
*/

(function () {

    L.Marker.prototype.spiderfyClusteredPopup = function() {
        if( !this._map && this.__parent && this.__parent._group && this.__parent._group.getVisibleParent ) {
            // popup the parent layer is appropriate
            var root = this.__parent._group.getVisibleParent(this);
            if(root) {
                root.spiderfy();
                return root;
            }
        }
        return null;
    };

    L.MarkerClusterGroup.prototype._alwaysSpiderfyCluster = function (layer) {
        var layers = layer.getAllChildMarkers();
        if(layers.length <= 1) {
            return false;
        }
        for(var i=1; i<layers.length; i++) {
            if( layers[i].getLatLng().distanceTo(layers[0].getLatLng()) > 0 ) {
                return false;
            }
        }
        return true;
    };

    L.MarkerClusterGroup.prototype._zoomOrSpiderfySuper = L.MarkerClusterGroup.prototype._zoomOrSpiderfy;
    L.MarkerClusterGroup.prototype._zoomOrSpiderfy = function (e) {
        if( this.options.spiderfyOnMaxZoom && this._alwaysSpiderfyCluster(e.layer) ) {
            e.layer.spiderfy();
            if (e.originalEvent && e.originalEvent.keyCode === 13) {
                this._map._container.focus();
            }
        } else {
            this._zoomOrSpiderfySuper(e);
        }
    };

})();
