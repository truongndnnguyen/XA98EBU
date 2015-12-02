'use strict';

/* globals util: false */
/* global moreInfo: true */

var app = app || {};
app.ui = app.ui || {};
app.ui.selection = app.ui.selection || {};

(function () {
    this.LAST_LATLNG_COOKIE_NAME = 'empublic-selected-latLng';
    this.clearSelectionTimeout = null;
    this.selectedFeature = null;

    this.toggle = function (feature) {
        if (this.selectedFeature === feature) {
            this.deselect();
        } else {
            this.select(feature);
        }
    };

    this.reselect = function () {
        if (this.selectedFeature) {
            this.select(this.selectedFeature, undefined, true);
        }
    };

    this.spiderfyLayer = function (layer) {
        if (!layer.spiderfyClusteredPopup) {
            return;
        }
        var spidercluster = layer.spiderfyClusteredPopup();
        if (spidercluster) {
            app.ui.selection.lastSpiderfyCluster = spidercluster;
        } else if (app.ui.selection.lastSpiderfyCluster && !layer._preSpiderfyLatlng) {
            app.ui.selection.lastSpiderfyCluster.unspiderfy();
            app.ui.selection.lastSpiderfyCluster = null;
        }
    };

    this.clearSpiderfy = function () {
        if (!app.ui.selection.selectedFeature && app.ui.selection.lastSpiderfyCluster) {
            app.ui.selection.lastSpiderfyCluster.unspiderfy();
            app.ui.selection.lastSpiderfyCluster = null;
        }
    };

    this.checkAlreadySpiderfyed = function (layer) {
        if (!this.lastSpiderfyCluster && layer._preSpiderfyLatlng) {
            this.lastSpiderfyCluster = layer.__parent;
        }
    };

    this.openFeaturePopup = function (feature, alreadyOpen) {
        var openedClusteredPopup = false;

        var layer = feature.layer || (feature.extendedFeature ? feature.extendedFeature.layer : null);
        if (layer === null) {
            return;
        }

        app.data.controllers.map(function (f) {
            return f.getLayer(L.stamp(layer));
        }).filter(function (f) {
            return f;
        }).map(function (layer) {
            app.ui.selection.spiderfyLayer(layer);
            app.ui.popup.openPopup(feature, layer, alreadyOpen);
            openedClusteredPopup = true;
        });
        if (openedClusteredPopup) {
            this.checkAlreadySpiderfyed(layer);
        } else {
            app.ui.popup.openPopup(feature, layer, alreadyOpen);
        }
    };

    this.select = function (feature, alreadyOpen, reselecting) {
        if (this.selectedFeature === feature) {
            app.ui.sidebar.highlightPanel(feature);
            if (reselecting !== true) {
                app.ui.zoomToFeature(feature, true);
            }
            //keep last selected feature in cookia
            util.cookies.set(this.LAST_LATLNG_COOKIE_NAME, JSON.stringify(feature.latLng), 0);
            return;
        }
        this.deselect();
        app.ui.zoomToFeature(feature, true);
        this.selectedFeature = feature;
        app.ui.sidebar.highlightPanel(feature);
        util.history.setPath(feature.classification.deeplinkurl);
        this.openFeaturePopup(feature, alreadyOpen);
        /* Hide sidebar and go to the map on small screens */
        if (document.body.clientWidth <= 767) {
            app.ui.layout.setSidebarVisible('map');
        }
    };

    this.deselect = function () {
        if (this.clearSelectionTimeout) {
            window.clearTimeout(this.clearSelectionTimeout);
            this.clearSelectionTimeout = null;
        }

        if (this.selectedFeature) {
            this.selectedFeature = null;
            util.history.clearPath();
            app.ui.sidebar.clearHighlightPanel();
            app.map.closePopup();
            //clear cookies
            //util.cookies.set(this.LAST_LATLNG_COOKIE_NAME, '', -1);
        }

        this.clearSelectionTimeout = window.setTimeout(this.clearSpiderfy, 250);
    };

    this.moreInfoDeeplinkURL = function (layer) {
        // deep linking for more info popup if more info existing on url
        app.ui.popup.showPopupDetail(layer.feature, layer.feature.classification, layer.feature.latLng);
    };

    this.selectByDeeplinkURL = function (linkUrl, pageLoading) {
        //check if url contains more info
        if (linkUrl.indexOf('/moreinfo') > -1) {
            moreInfo = true;
            linkUrl = linkUrl.substring(0, linkUrl.lastIndexOf('/'));
        }

        //select feature if url is matching
        var matched = false;
        app.data.visitAllLayers(function (layer) {

            if (layer.feature && layer.feature.classification && layer.feature.classification.deeplinkurl &&
                layer.feature.classification.deeplinkurl === linkUrl) {
                //check the coord to make sure matches.
                var lastLatLng = util.cookies.get(app.ui.selection.LAST_LATLNG_COOKIE_NAME);
                if (lastLatLng) {
                    lastLatLng = JSON.parse(lastLatLng);
                    if (layer.feature.latLng.lat != lastLatLng.lat ||
                        layer.feature.latLng.lng != lastLatLng.lng) {
                        return;
                    }
                };

                if (pageLoading) {
                    app.ui.zoomToFeature(layer.feature);
                }
                app.ui.selection.select(layer.feature);
                matched = true;
                if (moreInfo) {
                    app.ui.selection.moreInfoDeeplinkURL(layer);
                }
            }
        });

        if (!matched) {
            // no match...
            if (linkUrl.lastIndexOf('/') > 0) { // has another path
                linkUrl = linkUrl.substring(0, linkUrl.lastIndexOf('/'));
                app.ui.selection.selectByDeeplinkURL(linkUrl, pageLoading);
            } else {
                if (pageLoading) {
                    app.ui.alert.dataNotFound();
                }
            }
        }
    };

    this.init = function () {
    };

}).apply(app.ui.selection);
