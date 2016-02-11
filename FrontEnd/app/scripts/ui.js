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

    this.browserVersion = function() {
        var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1]) || /msie/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        //return M.join(' ');
        return M[0].replace(' ', '-');
    }

    this.init = function (isMapExisting) {
        app.ui.alert.init();
        app.ui.search.init();
        app.ui.staticMenu.init();
        app.ui.messageBox.init();
        app.session.init();
        if (isMapExisting) {
            app.ui.sidebar.init();
            app.ui.layout.init();
            app.ui.popup.init();
            app.ui.selection.init();
            app.ui.filter.init();
            app.ui.locateMe.init();
            app.ui.refreshControl.init();
        }
        $('body').addClass(this.browserVersion());
    };

}).apply(app.ui);
