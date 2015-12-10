'use strict';

/* globals app: false */

app.data.fdr = app.data.fdr || {};
(function () {

    this.getDataLayers = function () { console.log('getDataLayers'); return []; };
    this.getVisibleDataLayers = function () { console.log('getVisibleDataLayers'); return []; };
    this.getLayer = function () { console.log('getLayer'); return null; };

    this.refreshInterval = function () {
        return 60 * 1000;
    };

    app.data.filters = app.data.filters.concat(
    {
        thematicLayer: true,
        defaultHidden: true,
        name: 'Fire Danger Rating',
        rules: 'fdr',
    });
    app.data.controllers.push(this);

    this.getLayerForFilter = function (filterName) {
        console.log('getLayerForFilter ' + filterName);
        console.log(this.layer)
        return this.layer;
        //return null;
        //if (filterName !== 'Fire Danger Rating') return null;
        //return this.layer;
        //console.log('getLayerForFilter' + filterName);
        //var geojsonFeature = {
        //    "type": "Feature",
        //    "properties": {
        //        "name": "Coors Field",
        //        "amenity": "Baseball Stadium",
        //        "popupContent": "This is where the Rockies play!"
        //    },
        //    "geometry": {
        //        "type": "Point",
        //        "coordinates": [-35.508, 143.11]
        //    }
        //};
        //return L.geoJson(geojsonFeature);
        //var filters = app.rules.bom.filters.filter(function (filter) {
        //    return filter.name === filterName;
        //});
        //return filters.length ? filters[0].layer : null;
    };

    this.refreshData = function (callback) {
        //console.log('refreshData');
        //app.rules.bom.filters.map(function (filter) {
        //    filter.layer.getLayers().map(function (layer) {
        //        layer.setParams({
        //            _ts: new Date().getTime(),
        //            ISSUETIME: app.data.bom.getUTCTimestamp()
        //        });
        //    });
        //});
        //$.getJSON("/public/osom-fdrtfb.json", function (data) {
        //    console.log(data);
        //});
        //callback(app.data.fdr);
    };
    this.layer = null;

    this.init = function () {
        console.log('fdr initi.....')
        $.getJSON("/public/osom-fdr.json", function (data) {
            app.data.fdr.layer = L.geoJson(data, {
                style: function (feature) {
                    console.log(feature.properties.status)

                        return {
                            className: 'fdr fdr-' + feature.properties.status.toLowerCase().replace(/\s/g, '-')
                        }
                        //switch (feature.properties.status) {
                            //case 'CODE RED': return { color: "#ff0000", fillColor:'#000',className' };
                            //case 'SEVERE': return { color: "#0000ff" };
                            //case 'VERY HIGH': return { color: "#0000ff" };
                            //case 'HIGH': return { color: "#0000ff" };
                            //case 'LOW-MODERATE': return { color: "#0000ff" };
                        //}
                },
                pointToLayer: function (feature, latlng) {
                    var smallIcon = L.icon({
                            iconSize: [16, 16],
                            iconAnchor: [16, 16],
                            popupAnchor: [0, 0],
                            iconUrl: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/32/map-marker-icon.png'
                        });
                    return L.marker(latlng, { icon: smallIcon });
                }

                })

        });
        //var circle = L.circle([-35.508, 143.11], 100000, {
        //    color: 'red',
        //    fillColor: '#f03',
        //    fillOpacity: 0.5
        //})
        //console.log('set layer')
        //this.layer = circle;
        //var geojsonFeature = {
        //    "type": "Feature",
        //    "properties": {
        //        "name": "Coors Field",
        //        "amenity": "Baseball Stadium",
        //        "popupContent": "This is where the Rockies play!"
        //    },
        //    "geometry": {
        //        "type": "Point",
        //        "coordinates": [-35.508, 143.11]
        //    }
        //};
        //this.layer = L.geoJson(geojsonFeature);

        //var states = [{
        //    "type": "Feature",
        //    "properties": { "party": "Republican" },
        //    "geometry": {
        //        "type": "Polygon",
        //        "coordinates": [[
        //            [145.257797, -37.991834],
        //            [145.220718, -37.996704],
        //            [145.202179, -38.017804],
        //            [145.238571, -38.056742],
        //            [145.285950, -38.052957],
        //            [145.331955, -38.031327],
        //            [145.320282, -37.995622],
        //            [145.292816, -37.963147],
        //            [145.259171, -37.989669],
        //            [145.256424, -37.992916]
        //        ]]
        //    }
        //}, {
        //    "type": "Feature",
        //    "properties": { "party": "Democrat" },
        //    "geometry": {
        //        "type": "Polygon",
        //        "coordinates": [[
        //            [-109.05, 41.00],
        //            [-102.06, 40.99],
        //            [-102.03, 36.99],
        //            [-109.04, 36.99],
        //            [-109.05, 41.00]
        //        ]]
        //    }
        //}];

        //this.layer  = L.geoJson(states, {
        //    style: function (feature) {
        //        switch (feature.properties.party) {
        //            case 'Republican': return { color: "#ff0000" };
        //            case 'Democrat': return { color: "#0000ff" };
        //        }
        //    }
        //})

        //this.layer = L.layerGroup();
        //app.rules.bom.filters.map(function (filter) {
        //    filter.layer = L.layerGroup();
        //    filter.wmsLayerConf.map(function (conf) {
        //        filter.layer.addLayer(L.tileLayer.wms(filter.wmsLayerURL, {
        //            layers: conf.layers,
        //            format: 'image/png',
        //            transparent: true,
        //            crs: L.CRS.EPSG4326,
        //            zIndex: 1001,
        //            opacity: conf.opacity || 0.8,
        //            attribution: 'BOM MetEye',
        //            _ts: new Date().getTime(),
        //            ISSUETIME: app.data.bom.getUTCTimestamp()
        //        }));
        //    }, this);
        //}, this);
    };

}).apply(app.data.fdr);
