'use strict';
L.Control.EmvLocate = L.Control.Locate.extend({
    /* Include events mixin  */
    includes: L.Mixin.Events,

    /* Variable to hold current location */
    _currentLocation: null,
    /*
    Override _onLocationFound
    Justification: Set our _currentLocation variable and call _onLocationChanged().
    */
    _onLocationFound: function(e) {
        this.hideSpinner();
        // no need to do anything if the location has not changed
        if (this._event && (this._event.latlng.lat === e.latlng.lat &&
            this._event.latlng.lng === e.latlng.lng &&
            this._event.accuracy === e.accuracy)) {
            this._onLocationChanged();
            return;
        }

        if (!this._active) {
            return;
        }

        this._event = e;
        this._currentLocation = this._event.latlng;

        if (this.options.follow && this._following) {
            this._locateOnNextLocationFound = true;
        }

        this.drawMarker(this._map);

        this._onLocationChanged();
    },
    /*
    New function _onLocationChanged
    Justification: We need to notify our subscribers that the location has changed.
    */
    _onLocationChanged: function() {
        this.fire('locationChanged', this.getCurrentLocation());
    },
    /*
    New function getCurrentLocation
    Justification: 'Public' accessor for _currentLocation variable.
    */
    getCurrentLocation: function() {
        return this._currentLocation;
    },
    _onSetClasses: null,
    setOnSetClasses: function (callback) {
        this._onSetClasses = callback;
    },
    _setClasses: function(state) {
        if (this._onSetClasses) {
            this._onSetClasses(state);
        }
    },
    /*
    Override onAdd
    Justification: Refactored the link's click handler into a new function (triggerStart).
    */
    onAdd: function (map) {
        var container = L.DomUtil.create('div',
            'leaflet-control-locate leaflet-bar leaflet-control');

        this._layer = new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;

        // extend the follow marker style and circle from the normal style
        var tmp = {};
        L.extend(tmp, this.options.markerStyle, this.options.followMarkerStyle);
        this.options.followMarkerStyle = tmp;
        tmp = {};
        L.extend(tmp, this.options.circleStyle, this.options.followCircleStyle);
        this.options.followCircleStyle = tmp;

        this._link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        this._link.href = '#';
        this._link.title = this.options.strings.title;
        this._icon = L.DomUtil.create('span', this.options.icon, this._link);

        L.DomEvent
            .on(this._link, 'click', L.DomEvent.stopPropagation)
            .on(this._link, 'click', L.DomEvent.preventDefault)
            .on(this._link, 'click', function() {
                /* Note: Code from this block has been moved to new function triggerStart */
                this.triggerStart();
            }, this)
            .on(this._link, 'dblclick', L.DomEvent.stopPropagation);

        this._resetVariables();
        this.bindEvents(map);

        return container;
    },
    /*
    New function triggerStart
    Justification: Allows us to trigger the locate me functionality externally. Triggering the
    control's anchor using .click() did not work on some mobile devices (Android Browser 4.4).
    */
    triggerStart: function() {
        var shouldStop = (this._event === undefined ||
            this._map.getBounds().contains(this._event.latlng) ||
            !this.options.setView || this._isOutsideMapBounds());
        if (!this.options.remainActive && (this._active && shouldStop)) {
            this.stop();
        } else {
            this.start();
        }
    },
    /*
    New function zoomToLocation
    Justification: Moved from drawMarker so that logic can be triggered by marker click as well as when location is first found. Story 312 AC06.
    */
    zoomToLocation: function(map) {
        map.fitBounds(this._event.bounds, {
            padding: this.options.circlePadding,
            maxZoom: this.options.keepCurrentZoomLevel ?
            map.getZoom() : this.options.locateOptions.maxZoom
        });
    },
    drawMarker: function(map) {
        if (this._event.accuracy === undefined) {
            this._event.accuracy = 0;
        }

        var radius = this._event.accuracy;
        if (this._locateOnNextLocationFound) {
            if (this._isOutsideMapBounds()) {
                this.options.onLocationOutsideMapBounds(this);
            } else {
                // If accuracy info isn't desired, keep the current zoom level
                if(this.options.keepCurrentZoomLevel && !this.options.drawCircle){
                    map.panTo([this._event.latitude, this._event.longitude]);
                } else {
                    this.zoomToLocation(map);
                }
            }
            this._locateOnNextLocationFound = false;
        }

        // circle with the radius of the location's accuracy
        var style, o;
        if (this.options.drawCircle) {
            if (this._following) {
                style = this.options.followCircleStyle;
            } else {
                style = this.options.circleStyle;
            }

            if (!this._circle) {
                this._circle = L.circle(this._event.latlng, radius, style)
                .addTo(this._layer);
            } else {
                this._circle.setLatLng(this._event.latlng).setRadius(radius);
                for (o in style) {
                    this._circle.options[o] = style[o];
                }
            }
        }

        var distance, unit;
        if (this.options.metric) {
            distance = radius.toFixed(0);
            unit = 'meters';
        } else {
            distance = (radius * 3.2808399).toFixed(0);
            unit = 'feet';
        }

        // small inner marker
        var mStyle;
        if (this._following) {
            mStyle = this.options.followMarkerStyle;
        } else {
            mStyle = this.options.markerStyle;
        }

        if (!this._marker) {
            this._marker = this.createMarker(this._event.latlng, mStyle)
            .addTo(this._layer);

            /* Story 312 AC06: Pan and zoom to location when marker is clicked */
            L.DomEvent.on(this._marker, 'click', function() {
                this.zoomToLocation(map);
            }, this);
        } else {
            this.updateMarker(this._event.latlng, mStyle);
        }

        var t = this.options.strings.popup;
        if (this.options.showPopup && t) {
            this._marker.bindPopup(L.Util.template(t, {distance: distance, unit: unit}), {className: 'locate-control-popup'})
            ._popup.setLatLng(this._event.latlng);
        }

        this._toggleContainerStyle();
    },
    /*
    Override _onLocationError
    Justification: We need to know when a request has timed out so that we can show an error.
    By default the timeout error is suppressed.
    */
    _onLocationError: function(err) {
        this.stop();
        this.options.onLocationError(err);
    },

    hideSpinner: function() {
        $('.btn-locate-me .locate-me').show();
        $('.btn-locate-me .locate-me-spinner').hide();
    },

    showSpinner: function() {
        $('.btn-locate-me .locate-me').hide();
        $('.btn-locate-me .locate-me-spinner').show();
        if (util.detect.isFirefox()) {
            setTimeout(function() {
                var isVisible = $('.btn-locate-me .locate-me-spinner').is(":visible");
                app.map.locateMe.hideSpinner();
                if (isVisible) {  // display an error message if the geolocation error callback was not called within timeout.
                    var err = {code: 1};
                    app.showGeolocationError(err);
                }
            }, 20 * 1000);  // Due to a FF bug, the spinner cannot be turned off if the user refuses sharing the geolocation. More info: https://bugzilla.mozilla.org/show_bug.cgi?id=675533
        }
    },

    isActive: function() {
        return this._active;
    },
    /*
    Override stop()
    Justification: We need to notify our subscribers that the control has stopped.
    */
    stop: function() {
        this.hideSpinner();
        this._deactivate();

        this._cleanClasses();
        this._resetVariables();

        this.removeMarker();

        this.fire('stopped', this.getCurrentLocation());
    }
});

L.control.emvlocate = function (options) {
    return new L.Control.EmvLocate(options);
};
