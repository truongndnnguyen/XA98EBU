'use strict';

var app = app || {};
app.ui = app.ui || {};

(function() {

    this.zoomToFeature = function (feature, onlyIfNotInCurrentMap) {
        if( !app.map || !app.map._size || !app.map._size.x ) {
            return;
        }
        if( !feature.primaryFeature && feature.extendedFeature ) {
            this.zoomToFeature(feature.extendedFeature, onlyIfNotInCurrentMap);
        } else {
            if( feature.geometry.type === 'Point' ) {
                var latLng = feature.layer._preSpiderfyLatlng || feature.latLng;
                if( (onlyIfNotInCurrentMap !== true) || !app.map.getBounds().contains(latLng) ) {
                    app.map.setView(latLng,14, {animate:false});
                    app.map.fire('zoomend');
                }
            } else {
                if( (onlyIfNotInCurrentMap !== true) || !app.map.getBounds().contains(feature.layer.getBounds()) ) {
                    app.map.fitBounds(feature.layer.getBounds(), {
                        maxZoom: 15,
                        animate:false
                    });
                    app.map.fire('zoomend');
                }
            }
        }
    };

    this.init = function(isMapExisting) {
        app.ui.alert.init();
        app.ui.search.init();
        app.ui.staticMenu.init();
        app.ui.messageBox.init();
        if (isMapExisting) {
            app.ui.sidebar.init();
            app.ui.layout.init();
            app.ui.popup.init();
            app.ui.selection.init();
            app.ui.filter.init();
            app.ui.locateMe.init();
            app.ui.refreshControl.init();
        }
    };

}).apply(app.ui);
