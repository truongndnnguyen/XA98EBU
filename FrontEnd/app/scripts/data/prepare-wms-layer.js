'use strict';

/* globals app: false */

app.data.prepareWMSLayer = app.data.prepareWMSLayer || {};
(function() {
    this.filters = [
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Risk by township',
            rules: 'risk-by-township',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'cfa__vfrr_human_settlement_polygon', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Bushfire history',
            rules: 'Bushfire history',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'data_vic_gov_au__fire_history__bushfire__50year', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Last 10 years - treated area',
            rules: 'Last 10 years - treated area',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'data_vic_gov_au__fire_history__treated_area__10year', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'CFA map boundaries',
            rules: 'CFA map boundaries',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'vicmap_admin__cfa_district', opacity: 0.6 } //vicmap_admin__cfa_district,vicmap_admin__mfb_district
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'MFB map boundaries',
            rules: 'MFB map boundaries',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'vicmap_admin__mfb_district', opacity: 0.6 } //vicmap_admin__cfa_district,vicmap_admin__mfb_district
            ]
        },

        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Flood history - 100 years',
            rules: 'Flood history - 100 years',
            wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'EM:vic_flood_database__extent_100y_cumulative', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Flood history - 50 years',
            rules: 'Flood history - 50 years',
            wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'EM:vic_flood_database__extent_50y_cumulative', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Flood history - 30 years',
            rules: 'Flood history - 30 years',
            wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'EM:vic_flood_database__extent_30y_cumulative', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Flood history - 20 years',
            rules: 'Flood history - 20 years',
            wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'EM:vic_flood_database__extent_20y_cumulative', opacity: 0.6 }
            ]
        },
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    name: 'Flood history - 5 years',
        //    rules: 'Flood history - 5 years',
        //    wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'vic_flood_database__extent_5y_ari', opacity: 0.6 }
        //    ]
        //},
        {
            thematicLayer: true,
            defaultHidden: true,
            name: 'Flood history - 10 years',
            rules: 'Flood history - 10 years',
            wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'vic_flood_database__extent_10y_cumulative', opacity: 0.6 }
            ]
        }
    ];

    this.getDataLayers = function() { return []; };
    this.getVisibleDataLayers = function() { return []; };
    this.getLayer = function() { return null; };

    this.refreshInterval = function() {
        return 60 * 1000;
    };

    app.data.filters = app.data.filters.concat(this.filters);
    app.data.controllers.push(this);

    this.getLayerForFilter = function (filterName) {
        var filters = app.data.prepareWMSLayer.filters.filter(function (filter) {
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
            '' + app.data.prepareWMSLayer.pad(date.getUTCMonth() + 1) +
            '' + app.data.prepareWMSLayer.pad(date.getUTCDate()) +
            '' + app.data.prepareWMSLayer.pad(date.getUTCHours()) +
            '' + app.data.prepareWMSLayer.pad(date.getUTCMinutes()) +
            '' + app.data.prepareWMSLayer.pad(date.getUTCSeconds());
    };

    this.refreshData = function(callback) {
        app.data.prepareWMSLayer.filters.map(function (filter) {
            if (filter.layer) {
                filter.layer.getLayers().map(function (layer) {
                    layer.setParams({
                        _ts: new Date().getTime(),
                        ISSUETIME: app.data.prepareWMSLayer.getUTCTimestamp()
                    });
                });
            }
        });
        callback(app.data.prepareWMSLayer);
    };

    this.initLayers = function () {
        this.filters.map(function (filter) {
            filter.layer = L.layerGroup();
            filter.wmsLayerConf.map(function (conf) {
                filter.layer.addLayer(L.tileLayer.wms(filter.wmsLayerURL, {
                    layers: conf.layers,
                    format: 'image/png',
                    transparent: true,
                    crs: L.CRS.EPSG4326,
                    zIndex: 1001,
                    opacity: conf.opacity || 0.6,
                    attribution: 'BOM MetEye',
                    _ts: new Date().getTime(),
                    ISSUETIME: app.data.prepareWMSLayer.getUTCTimestamp()
                }));
            }, this);
        }, this);
    }
    this.init = function() {
        this.initLayers();
    };

}).apply(app.data.prepareWMSLayer);
