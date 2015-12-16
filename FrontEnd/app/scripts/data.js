'use strict';

/* globals util: false */

var app = app||{};
app.data = app.data || {};

(function() {

    this.filters = [];
    this.controllers = [];
    this.summary = {};

    /* Reference location is either current location or location from search */
    this.referenceLocation = null;
    /* Is automatic data refresh enabled? Psuedo-private, should be set through the setAutomaticDataRefresh(bool) function */
    this._automaticRefreshEnabled = true;

    this.FAST_POLL_DELAY = 2000;
    this.FAST_POLL_MIN_REFRESH = 10000;

    this.createIconForCluster = function(cluster) {
        var cmp = function(x, y){ return x > y? 1 : x < y ? -1 : 0; };
        var idx = function(x) {
            if( x.feature && x.feature.classification && x.feature.classification.riskRating ) {
                return x.feature.classification.riskRating;
            } else {
                return x.options.zIndexOffset;
            }
        };
        var allMarkers = cluster.getAllChildMarkers();
        allMarkers.sort(function(a,b){
            return cmp(idx(b), idx(a));
        });

        cluster.setZIndexOffset(idx(allMarkers[0]));
        cluster.options.riseOnHover = true;
        cluster.options.riseOffset = 2000;

        var iconClass = allMarkers[0].defaultOptions.icon.options.iconClass;
        var iconHtml = util.symbology.getIcon(iconClass, true, 'Marker cluster. Click to expand.');

        return L.divIcon({
            className: null,
            iconSize: null,
            iconAnchor: [15, 15],
            html: iconHtml,
            popupAnchor: [15, 15]
        });
    };

    this.createMarkerCluster = function(name) {
        return new L.MarkerClusterGroup({
            category: name,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: true,
            zoomToBoundsOnClick: true,
            // disableClusteringAtZoom: 16,
            maxClusterRadius: 40,
            polygonOptions: {
                color: 'black'
            },
            iconCreateFunction: this.createIconForCluster
        });
    };

    this.setDataLayerVisibility = function (category, visibility) {
        this.controllers.filter(function(c){
            return c.getLayerForFilter;
        }).map(function(f){
            return f.getLayerForFilter(category);
        }).filter(function(f){
            return f;
        }).map(function (layer) {
            if( visibility ) {
                app.map.addLayer(layer);
            } else {
                app.map.removeLayer(layer);
            }
        });
    };

    this.batchUpdateDataLayerVisibility = function() {
        this.controllers.filter(function(c){
            return c.batchUpdateDataLayerVisibility;
        }).map(function(c){
            c.batchUpdateDataLayerVisibility();
        });
    };

    this.buildCategoryModel = function() {
        var categoryModel = {};
        this.filters.forEach(function(f){
            categoryModel[f.name] = {
                count: 0,
                visible: f.visible
            };
        });

        var visitedFeatures = {};
        this.controllers.forEach(function(controller){
            if( controller.getAllFeatures ) {
                var features = controller.getAllFeatures() || [];
                features.forEach(function(feature) {
                    // check for duplicates
                    var visited = visitedFeatures[feature.classification.deeplinkurl] || false;
                    visitedFeatures[feature.classification.deeplinkurl] = true;
                    if( visited ) {
                        return;
                    }
                    feature.classification.categories.forEach(function(cat){
                        categoryModel[cat] = categoryModel[cat] || {count:0, visible:true};
                        categoryModel[cat].count++;
                    });
                });
            } else {
                controller.getDataLayers().forEach(function(dataLayer){
                    dataLayer.eachLayer(function(layer) {
                        // check for duplicates
                        var visited = visitedFeatures[layer.feature.classification.deeplinkurl] || false;
                        visitedFeatures[layer.feature.classification.deeplinkurl] = true;
                        if( visited ) {
                            return;
                        }
                        layer.feature.classification.categories.forEach(function(cat){
                            categoryModel[cat] = categoryModel[cat] || {count:0, visible:true};
                            categoryModel[cat].count++;
                        });
                    });
                });
            }
        });

        return categoryModel;
    };

    this.visitVisibleLayers = function(visitCallback, visitObject) {
        /* Loop through events layer and add only features which are in the map bounds */
        var calledFeatures = {};
        var summary = {
            warning: { within: 0, outside: 0},
            other: { within: 0, outside: 0}
        };

        this.controllers.forEach(function (controller) {
            controller.getVisibleDataLayers().forEach(function(dataLayer){
                dataLayer.eachLayer(function(layer) {
                    var latLng = null;
                    var isPoint = false;
                    if (layer.getLatLng) {
                        isPoint = true;
                        if( app.map.getBounds().contains(layer.getLatLng())) {
                            latLng = layer.getLatLng();
                        }
                    } else if (app.map.getBounds().intersects(layer.getBounds())) {
                        latLng = layer.getBounds().getCenter();
                    }

                    var isUnlisted = layer.feature.classification.unlisted;
                    if (isPoint && !isUnlisted) {
                        var type = 'other';
                        if (layer.feature.properties && (layer.feature.properties.feedType === 'warning')) {
                            type = 'warning';
                        }
                        var isWithinName = (latLng!==null) ? 'within' : 'outside';
                        summary[type][isWithinName]++;
                    }

                    if(latLng !== null) {
                        layer.feature.latLng = latLng;
                        var called = calledFeatures[layer.feature.classification.deeplinkurl] || false;
                        calledFeatures[layer.feature.classification.deeplinkurl] = true;
                        if(!called) {
                            visitCallback.call(visitObject||this, layer);
                        }
                    }
                });
            });
        });
        app.data.summary = summary;
    };

    this.visitAllLayers = function(visitCallback, visitObject) {
        this.controllers.forEach(function(controller){
            controller.getDataLayers().forEach(function(dataLayer){
                dataLayer.eachLayer(function(layer) {
                    visitCallback.call(visitObject||this, layer);
                });
            });
        });
    };

    this.setReferenceLocation = function(referenceLocation) {
        this.referenceLocation = referenceLocation;
        this.controllers.map(function(controller){
            if( controller.recalculateDistanceToReferenceLocation ) {
                controller.recalculateDistanceToReferenceLocation();
            }
        });

        app.ui.sidebar.sync();
    };

    this.clearReferenceLocation = function() {
        this.setReferenceLocation(null);
    };

    this.describeDistanceToReferenceLocation = function(feature) {
        if (this.referenceLocation !== null && typeof(feature.latLng) !== 'undefined') {
            var km = (0.001 * feature.latLng.distanceTo(this.referenceLocation.latLng)).toFixed(2);
            return km + ' km from ' + this.referenceLocation.label;
        }
        return 'No location set';
    };

    /* Clear existing timeout on controller */
    this.clearControllerTimeout = function(controller) {
        if (controller.refreshData && controller.timeout) {
            clearTimeout(controller.timeout);
            controller.timeout = null;
        }
    };

    /* Refresh controller data - use as callback */
    this.refreshController = function(controller) {
        if (app.data.automaticRefreshEnabled()) {
            if (controller.refreshData) {
                // ensure last refreshed has a sensible value
                if( !controller.lastRefreshed ) {
                    controller.lastRefreshed = Date.now();
                }

                app.data.clearControllerTimeout(controller);
                controller.timeout = setTimeout(function() {
                    if( controller.lastRefreshed+app.data.FAST_POLL_MIN_REFRESH >= Date.now() ) {
                        // do nothing... we don't want to reload so soon.
                        app.data.refreshController(controller);
                    } else if( (controller.lastRefreshed+controller.refreshInterval()) <= Date.now() ) {
                        // time to hard refresh the controller...
                        controller.lastRefreshed = Date.now();
                        controller.refreshData(app.data.refreshController);
                    } else {
                        // check for a fast poll of the controller
                        if( controller.fastPollRefreshData ) {
                            controller.fastPollRefreshData(function(refresh){
                                if( refresh ) {
                                    controller.refreshData(app.data.refreshController);
                                } else {
                                    app.data.refreshController(controller);
                                }
                            });
                        }
                    }
                }, app.data.FAST_POLL_DELAY);
            }
        }
    };

    /* Refresh controller data - manual trigger */
    this.refresh = function() {
        this.controllers.map(function(controller){
            app.data.clearControllerTimeout(controller);
            if (controller.refreshData) {
                controller.timeout = setTimeout(function(){
                    controller.lastRefreshed = Date.now();
                    controller.refreshData(app.data.refreshController);
                }, 0);
            }
        });
    };

    /* Public getter for _automaticRefreshEnabled variable */
    this.automaticRefreshEnabled = function() {
        return this._automaticRefreshEnabled;
    };

    /* Public setter for _automaticRefreshEnabled variable */
    this.setAutomaticRefreshEnabled = function(value) {
        this._automaticRefreshEnabled = value;

        this.controllers.map(function(controller) {
            app.data.clearControllerTimeout(controller);
            if (value) {
                app.data.refreshController(controller);
            }
        });
    };

    /* Toggle automatic refresh (triggered by UI elements) */
    this.toggleAutomaticRefresh = function() {
        this.setAutomaticRefreshEnabled(!this.automaticRefreshEnabled());
    };

    this.init = function() {
        this.controllers.map(function(controller){
            controller.init();
        });

        if( util.feature.toggles.isolatewarnings ) {
            this.filters.filter(function(f){
                return f.name === 'Warnings';
            }).forEach(function(f) {
                f.isolateCluster = true;
            });
        }
        if( util.feature.toggles.isolateall ) {
            this.filters.forEach(function(f) {
                f.isolateCluster = true;
            });
        }

        this.filters.forEach(function(f) {
            f.visible = f.visible || (f.defaultHidden ? false : true); // on by default
            f.visible = util.cookies.getBoolean(f.name,f.visible);
            f.visible = ( f.fixed === true ) || f.visible;
            this.setDataLayerVisibility(f.name, f.visible);
        }, this);

        app.ui.filter.updateFilterVisibility();
        this.batchUpdateDataLayerVisibility();

        app.ui.askSlowConnection.start();
        var testRefreshSec = util.feature.getQueryVariable(window.location.search, 'testrefreshsec');
        testRefreshSec = testRefreshSec || 0;
        setTimeout(function() {
            app.data.refresh();
            app.ui.askSlowConnection.stop();
        }, testRefreshSec * 1000);
    };

}).apply(app.data);
