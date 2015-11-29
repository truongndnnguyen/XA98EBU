'use strict';

/* globals app: false */
/* globals util: false */

app.control = app.control || {};
app.Control = app.Control || {};

app.Control.LayerControl = L.Control.Layers.extend({
    _baseLayers: null,
    _selectedIndex: 0,
    options: {
        position: 'bottomleft',
        autoZIndex: true
    },
    initialize: function (baseLayers, options) {
        L.setOptions(this, options);
        /* Initialize defaults */
        this._layers = [];
        this._lastZIndex = 0;
        this._handlingClick = false;
        /* Create layers from param */
        for (var i = 0; i < baseLayers.length; i++) {
            var l = baseLayers[i];
            this._addLayer(l.tileLayer, l.name, l.title, l.description);
        }
        /* Set selected index from cookie value (defaults to zero) */
        this._selectedIndex = this._getLayerIndex(util.cookies.get('empublic-basemap'));
    },
    addBaseLayer: function (layer, name, title, description) {
        this._addLayer(layer, name, title, description);
        this._update();
        return this;
    },
    addOverlay: function () {
        return this;
    },
    removeLayer: function (layer) {
        var id = L.stamp(layer);
        this._layers = this._layers.filter(function (item) {
            return item.id !== id;
        });
        this._selectedIndex = 0;
        this._update();
        return this;
    },
    _initLayout: function () {
        /* Container */
        this._container = L.DomUtil.create('div', 'layer-control-container layer-control');
        /* Create layer toggle */
        this.layerToggle = L.DomUtil.create('a', '', this._container);
        this.layerToggle.id = 'layer-toggle';
        this.layerToggle.href = '#';
        L.DomEvent.on(this.layerToggle, 'click', this._onInputClick, this);
        /* Create layer label (for accessibility) */
        this.layerLabel = L.DomUtil.create('span', 'sr-only', this.layerToggle);
        /* Trigger update */
        this._update();
    },
    _addLayer: function (layer, name, title, description) {
        var id = L.stamp(layer);

        this._layers.push({
            id: id,
            layer: layer,
            name: name,
            title: title,
            description: description,
            overlay: null /* Overlays not supported */
        });

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },
    _onInputClick: function (event) {
        event.preventDefault();
        this._handlingClick = true;

        /* Remove currently selected layer from map */
        var selectedLayer = this._getSelectedLayer();
        if (this._map.hasLayer(selectedLayer.layer)) {
            this._map.removeLayer(selectedLayer.layer);
        }
        /* Increment selected index */
        this._selectedIndex = (this._selectedIndex + 1) % this._layers.length;
        /* Trigger update and refocus */
        this._update();
        this._refocusOnMap(event); /* Must pass event so that focus returns to map on mouse click only */

        this._handlingClick = false;
    },
    _fixGoogleLayer: function() {  // the bower_components\leaflet-plugins\layer\tile\Google.js adds leaflet-top class name but it shouldn't because it causes isse #367.
        $('.leaflet-google-layer').removeClass('leaflet-top');
    },
    _update: function() {
        var selectedLayer = this._getSelectedLayer();
        /* Update UI elements */
        this.layerToggle.className = selectedLayer.name;
        this.layerLabel.innerHTML = 'Toggle map view - now showing ' + selectedLayer.description;
        /* Add layer to map */
        if (!this._map.hasLayer(selectedLayer.layer)) {
            this._map.addLayer(selectedLayer.layer);
        }
        /* Update cookie */
        util.cookies.set('empublic-basemap', selectedLayer.name);
        this._fixGoogleLayer();
    },
    _getSelectedLayer: function() {
        return this._layers[this._selectedIndex];
    },
    _getLayer: function(id) {
        var layer = null;
        if (id > 0) {
            for (var i = 0; i < this._layers.length; i++) {
                if (this._layers[i].id === id) {
                    layer = this._layers[i];
                    break;
                }
            }
        }
        return layer;
    },
    _getLayerIndex: function(name) {
        var index = 0;
        if (name !== null && name.length > 0) {
            for (var i = 0; i < this._layers.length; i++) {
                if (this._layers[i].name === name) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
});

app.control.layerToggle = function (baseLayers, options) {
    return new app.Control.LayerControl(baseLayers, options);
};
