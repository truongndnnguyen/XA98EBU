'use strict';
var app = app || {};

/* globals util: false */
/* globals ga: false */
/* jshint unused:false */

function fromBBoxString(str) {
    var arr = str.split(/,/);
    if( arr.length !== 4 ) {
        return L.latLngBounds(L.latLng(-39.18, 140.95), L.latLng(-33.97, 149.98));
    }
    return [[arr[1],arr[0]],[arr[3],arr[2]]];
}

(function() {
    /* Overlay Layers */
    L.Icon.Default.imagePath = 'styles/images';

    this.showGeolocationError = function (err) {
        if (err.code === 1) {
            /* Location sharing is off */
            var device = 'browser';
            if (app.ui.layout.isMobileClient()) {
                device = 'device';
            }
            app.ui.alert.error('Location Services is disabled. Please turn on Location services in your ' + device + ' settings');
        } else if (err.code === 3) {
            /* Geolocation API timed out */
            app.ui.alert.error('We\'re unable to locate you at this time.'); // TODO: Confirm error message
        }
    }

    this.initMap = function() {
        var victoriaBounds = '140.95,-39.18,149.98,-33.97';
        var australiaBounds = '113.2,-10,170,-80'; //154->170, -44->-80
        var bbox = util.cookies.get('empublic-bbox') || victoriaBounds;

        this.map = L.map('map', {
            crs: L.CRS.EPSG3857,
            zoomControl: false,
            attributionControl: false,
            minZoom: 1,
            maxZoom: 20,
            maxBounds: fromBBoxString(australiaBounds)
        }).fitBounds(fromBBoxString(bbox));
        setTimeout(function(){
            app.map.fitBounds(fromBBoxString(bbox));
        },0);

        var satellite, cartographic, hybrid;
        if( util.feature.toggles.googleapi ) {
            // SATELLITE, ROADMAP, HYBRID, TERRAIN
            satellite = new L.Google('SATELLITE');
            hybrid = new L.Google('HYBRID');
            cartographic = new L.Google('ROADMAP');
            this.map._leafletPanBy = this.map.panBy;
            this.map.panBy = function(offset,options) {
                options = L.extend({animate:false}, options||{});
                this._leafletPanBy(offset, options);
            };
        } else if( util.feature.toggles.google ) {
            satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            });
            hybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            });
            cartographic = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            });
        } else {
            satellite = L.tileLayer.gwc('//maps.em.vic.gov.au/gwc_cache/wm_satellite/BT_ESRI_EPSG_3857_{z}/{dx}_{dy}/{x}_{y}.jpeg', {
                format: 'image/jpeg',
                minZoom: 6,
                tms: true,
                maxZoom: 20,
                tileSize: 512,
                transparent: false,
                attribution: 'Vicmap Satellite'
            });
            cartographic = L.tileLayer.arcgis('//maps.em.vic.gov.au/arcgis_cache/wm_carto/_alllayers/{z}/{y}/{x}.png', {
                attribution: 'Vicmap Cartographic',
                zIndex: 0,
                maxZoom: 20,
                minZoom: 6,
                tileSize: 512
            });
            hybrid = L.layerGroup([
                L.tileLayer.gwc('//maps.em.vic.gov.au/gwc_cache/wm_satellite/BT_ESRI_EPSG_3857_{z}/{dx}_{dy}/{x}_{y}.jpeg', {
                    format: 'image/jpeg',
                    minZoom: 6,
                    tms: true,
                    maxZoom: 20,
                    tileSize: 512,
                    transparent: false,
                    attribution: 'Vicmap Satellite'
                }),
                L.tileLayer.arcgis('//maps.em.vic.gov.au/arcgis_cache/wm_hybrid/_alllayers/{z}/{y}/{x}.png', {
                    attribution: 'Vicmap Hybrid',
                    zIndex: 1,
                    opacity: 0.7,
                    maxZoom: 20,
                    minZoom: 6,
                    tileSize: 512
                })
            ]);
        }

        /* Layer toggle control */
        var baseLayers = [{
                name: 'VicMapCartographic',
                tileLayer: cartographic,
                title: 'Road map',
                description: 'Road map'
            }, {
                name: 'VicMapHybrid',
                tileLayer: hybrid,
                title: 'Hybrid',
                description: 'Hybrid (road map and satellite images)'
            }
            // {
            //     name: 'VicMapSatellite',
            //     tileLayer: satellite,
            //     title: 'Satellite',
            //     description: 'Satellite images'
            // }
        ];

        var layersControl = app.control.layerToggle(baseLayers, {
            position: 'bottomleft'
        });
        layersControl.addTo(this.map);

        /* Filter sidebar feature list to only show features in current map bounds */
        this.map.on('moveend', function() {
            // save current viewport
            util.cookies.set('empublic-bbox', app.map.getBounds().toBBoxString());
            app.ui.sidebar.sync();
        });

        /* Attribution control */
        this.map.updateAttribution = function() {
            $.each(this._layers, function(index, layer) {
                if (layer.getAttribution) {
                    $('#attribution').html((layer.getAttribution()));
                }
            });
        };

        this.map.on('layeradd', this.map.updateAttribution);
        this.map.on('layerremove', this.map.updateAttribution);

        /* zoom in/out controls */
        L.control.zoom({
            position: 'topleft',
            zoomInText: '<i class="fa fa-plus" aria-hidden="true"><span class="sr-only">Zoom in</span></i>',
            zoomInTitle: 'Zoom in',
            zoomOutText: '<i class="fa fa-minus" aria-hidden="true"><span class="sr-only">Zoom out</span></i>',
            zoomOutTitle: 'Zoom out'
        }).addTo(this.map);

        /* show all control (victoria state overview) */
        L.control.showAll({
            bounds: L.latLngBounds(fromBBoxString(victoriaBounds)),
            position: 'topleft',
            title: 'Show Victoria state view',
            icon: 'icon-controls-zoom_to_state'
        }).addTo(this.map);

        $('.leaflet-control-showall a').html('<i class="fa fa-lg icon-controls-zoom_to_state" style="vertical-align:-25%;"><span class="sr-only">Show Victoria state view</span></i>');  // move SPAN into I because google GTM needs it.

        $('.leaflet-control-showall a').click(function(e) {
            /* Do not prevent propogation to control. Trigger close button on popup: */
            $('.feature-row').removeClass('selectedPanel');
            var popupCloseButton = $('.leaflet-popup .leaflet-popup-close-button');
            if (popupCloseButton.length > 0) {
                popupCloseButton[0].click();
            }
        });

        /* GPS enabled geolocation control set to follow the user's location */
        this.map.locateMe = L.control.emvlocate({
            position: 'topleft',
            drawCircle: true,
            follow: false, /* Story 312 AC07: Don't follow the user */
            setView: true,
            keepCurrentZoomLevel: false,
            markerStyle: {
                weight: 8,
                opacity: 1,
                fillOpacity: 1
            },
            circleStyle: {
                weight: 1,
                clickable: false
            },
            metric: true,
            strings: {
                title: 'My location',
                popup: 'You are within {distance} metres of this point',
                outsideMapBoundsMsg: 'You seem to be located outside the boundaries of the map'
            },
            locateOptions: {
                maxZoom: 14,
                watch: true,
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 10000
            },
            onLocationError: function(err) {
                app.showGeolocationError(err);
            }
        });
        this.map.locateMe.on('locationChanged', function(latLng) {
            app.data.setReferenceLocation({
                latLng: latLng,
                label: 'your current location'
            });
        });
        this.map.locateMe.on('stopped', function() {
            app.data.clearReferenceLocation();
        });
        this.map.addControl(this.map.locateMe);

        /* Refresh control */
        this.map.refreshControl = app.refreshControl({
            position: 'bottomright',
            refreshControl: {
                title: 'Refresh map data',
                refreshContent: '<i class="fa fa-refresh" aria-hidden="true"></i><span class="sr-only">Refresh map data</span>',
                loadingContent: '<img src="images/animated/Loading-000000-FFFFFF-32.gif" alt="Loading" width="16" height="16" />'
            },
            pauseControl: {
                title: 'Pause automatic updates',
                pauseContent: '<i class="fa fa-pause" aria-hidden="true"></i><span class="sr-only">Pause automatic updates</span>'
            }
        });
        this.map.addControl(this.map.refreshControl);

        app.ui.refreshManager.init([this.map.refreshControl, app.ui.refreshControl]);
        app.ui.refreshManager.onRefreshClick = function() {
            app.data.refresh();
        };
        app.ui.refreshManager.onPauseClick = function() {
            /* Let the data object be the 'source of truth' regarding whether data refresh is enabled. */
            /* Set button status based on value from app.data. */
            app.data.toggleAutomaticRefresh();
            app.ui.refreshManager.setPaused(!app.data.automaticRefreshEnabled());
        };

        this.map.showAll = function() {
            this.fitBounds(L.latLngBounds(fromBBoxString(victoriaBounds)));
        };

        this.map.showMe = function(latLng) {
            var bounds = L.latLngBounds(fromBBoxString(victoriaBounds));
            bounds.extend(latLng);
            this.fitBounds(bounds);
        };
        this.map.on('popupopen', function (ev) {
            app.ui.watchZone.onEditorOpen(ev);
            //replace popup close button
            console.log(ev);
            ev.popup._closeButton.innerHTML = '<img class="icon-media-cross" alt="Close" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><span class="sr-only">Close</span>'
            //app.ui.watchZone.initEditor(ev);
        })
    };

}).apply(app);
