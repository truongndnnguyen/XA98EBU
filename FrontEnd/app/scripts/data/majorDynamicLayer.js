'use strict';

/* globals app: false */

app.data.majorDynamicLayer = app.data.majorDynamicLayer || {};
(function() {

    this.getDataLayers = function() { return []; };
    this.getVisibleDataLayers = function() { return []; };
    this.getLayer = function() { return null; };

    this.refreshInterval = function() {
        return 60 * 1000;
    };

    //app.data.filters = app.data.filters.concat(app.rules.bom.filters);
    app.data.controllers.push(this);

    this.getLayerForFilter = function(filterName) {
        var filters = app.rules.majorDynamicLayer.filters.filter(function (filter) {
            return filter.name === filterName;
        });
        return filters.length ? filters[0].layer : null;
    };

    this.pad = function(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    };

    this.getUTCTimestamp = function() {
        var date = new Date();
        return date.getUTCFullYear() +
            '' + app.data.majorDynamicLayer.pad(date.getUTCMonth() + 1) +
            '' + app.data.majorDynamicLayer.pad(date.getUTCDate()) +
            '' + app.data.majorDynamicLayer.pad(date.getUTCHours()) +
            '' + app.data.majorDynamicLayer.pad(date.getUTCMinutes()) +
            '' + app.data.majorDynamicLayer.pad(date.getUTCSeconds());
    };

    this.refreshData = function(callback) {
        app.rules.majorDynamicLayer.filters.map(function (filter) {
            filter.layer.getLayers().map(function(layer){
                layer.setParams({
                    _ts: new Date().getTime(),
                    ISSUETIME: app.data.majorDynamicLayer.getUTCTimestamp()
                });
            });
        });
        callback(app.data.majorDynamicLayer);
    };

    this.initLayers = function () {
        app.rules.majorDynamicLayer.filters.map(function (filter) {
            filter.layer = L.layerGroup();
            filter.wmsLayerConf.map(function (conf) {
                filter.layer.addLayer(L.tileLayer.wms(filter.wmsLayerURL, {
                    layers: conf.layers,
                    format: 'image/png',
                    transparent: true,
                    crs: L.CRS.EPSG4326,
                    zIndex: 1001,
                    opacity: conf.opacity || 0.8,
                    attribution: 'BOM MetEye',
                    _ts: new Date().getTime(),
                    ISSUETIME: app.data.majorDynamicLayer.getUTCTimestamp()
                }));
            }, this);
        }, this);
    }
    this.init = function() {
        this.initLayers();
    };

}).apply(app.data.majorDynamicLayer);
