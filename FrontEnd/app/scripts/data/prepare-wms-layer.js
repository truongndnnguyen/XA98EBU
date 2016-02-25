'use strict';

/* globals app: false */

app.data.prepareWMSLayer = app.data.prepareWMSLayer || {};
(function() {
    this.filters = [
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Fire',
        //    order: 90,
        //    name: 'Risk by township',
        //    rules: 'risk-by-township',
        //    description: 'The Victorian Fire Risk Register maps the areas considered of risk of bushfire.',
        //    wmsLayerURL: 'http://54.66.157.131/geoserver/EM/wms',
        //    CRS:L.CRS.EPSG44283,
        //    wmsLayerConf: [
        //        { layers: 'EM:cfa__vfrr_human_settlement_polygon', opacity: 0.6, styles:'cfa__vfrr_human_settlement_polygon_red' }
        //    ]
        //},
        {
            thematicLayer: true,
            defaultHidden: true,
            layerGroup: 'Fire',
            order: 89,
            name: 'Bushfire history - 50 years',
            rules: 'Bushfire history - 50 years',
            description: 'This shows the areas burnt by bushfires over the last 50 years',
            wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'data_vic_gov_au__fire_history__bushfire__50year', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            layerGroup: 'Fire',
            order: 71,
            name: 'Planned burns - last 10 years',
            rules: 'Planned burns - last 10 years',
            description: 'Shows all planned burns completed on public land over the past 10 years.',
            wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'data_vic_gov_au__fire_history__treated_area__10year', opacity: 0.6 }
            ]
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            layerGroup: 'Fire',
            order: 70,
            name: 'CFA & MFB district boundaries',
            rules: 'CFA & MFB district boundaries',
            description: 'Shows the area covered by the CFA & MFB districts',
            wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'vicmap_admin__cfa_and_mfb_districts', opacity: 0.6 } //vicmap_admin__cfa_district,vicmap_admin__mfb_district
            ]
        },
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Fire',
        //    order: 69,
        //    name: 'MFB map boundaries',
        //    rules: 'MFB map boundaries',
        //    description:'Shows the area covered by the MFB',
        //    wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'vicmap_admin__mfb_district', opacity: 0.6 } //vicmap_admin__cfa_district,vicmap_admin__mfb_district
        //    ]
        //},
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Flood',
        //    name: 'Flood history - 5 years',
        //    rules: 'Flood history - 5 years',
        //    description: 'This shows the areas impacted by flooding over the last 5 years',
        //    wmsLayerURL: ' http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'EM:vic_flood_database__extent_5y_ari', opacity: 0.6 }
        //    ]
        //},
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Flood',
        //    name: 'Flood history - 10 years',
        //    rules: 'Flood history - 10 years',
        //    description: 'This shows the areas impacted by flooding over the last 10 years',
        //    wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'EM:vic_flood_database__extent_10y_cumulative', opacity: 0.6 }
        //    ]
        //},
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Flood',
        //    name: 'Flood history - 20 years',
        //    rules: 'Flood history - 20 years',
        //    description: 'This shows the areas impacted by flooding over the last 20 years',
        //    wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'EM:vic_flood_database__extent_20y_cumulative', opacity: 0.6 }
        //    ]
        //},
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Flood',
        //    name: 'Flood history - 30 years',
        //    rules: 'Flood history - 30 years',
        //    description: 'This shows the areas impacted by flooding over the last 30 years',
        //    wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'EM:vic_flood_database__extent_30y_cumulative', opacity: 0.6 }
        //    ]
        //},
        //{
        //    thematicLayer: true,
        //    defaultHidden: true,
        //    layerGroup: 'Flood',
        //    name: 'Flood history - 50 years',
        //    rules: 'Flood history - 50 years',
        //    description: 'This shows the areas impacted by flooding over the last 50 years',
        //    wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
        //    wmsLayerConf: [
        //        { layers: 'EM:vic_flood_database__extent_50y_cumulative', opacity: 0.6 }
        //    ]
        //},
        {
            thematicLayer: true,
            defaultHidden: true,
            layerGroup: 'Flood',
            name: 'Flood likelihood - 100 years',
            rules: 'Flood likelihood - 100 years',
            description: 'This shows the likelihood of areas flooding in a 100 year period',
            wmsLayerURL: 'http://maps.em.vic.gov.au/geoserver/EM/wms',
            wmsLayerConf: [
                { layers: 'EM:vic_flood_database__extent_100y_ari', opacity: 0.6 }
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

    //Should cleanup & create a share wms layer code.

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
                var options =
                {
                    layers: conf.layers,
                    format: 'image/png',
                    transparent: true,
                    crs: filter.CRS||L.CRS.EPSG4326,
                    zIndex: 1001,
                    opacity: conf.opacity || 0.6,
                    //attribution: 'BOM MetEye',
                    _ts: new Date().getTime(),
                    ISSUETIME: app.data.prepareWMSLayer.getUTCTimestamp(),
                };
                if(conf.styles) {
                    options.styles = conf.styles
                };

                filter.layer.addLayer(L.tileLayer.wms(filter.wmsLayerURL, options));
            }, this);
        }, this);
    }
    this.init = function() {
        this.initLayers();
    };

}).apply(app.data.prepareWMSLayer);
