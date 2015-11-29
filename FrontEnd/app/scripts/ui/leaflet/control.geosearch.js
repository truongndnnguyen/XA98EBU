'use strict';

/* globals AddressPicker: false */

var app = app || {};
app.control = app.control || {};

app.control.GeoSearchControl = L.Control.extend({
    options: {
        position: 'topcenter',
        locate: function(){}
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.addressPicker = new AddressPicker({
            autocompleteService: {
                componentRestrictions: { country: 'AU' },
                placeDetails: true
            }
        });
    },

    onAdd: function() {
        var control = this;
        var container = L.DomUtil.create('div', 'geosearch-control');
        this.geosearchInput = L.DomUtil.create('input', 'control-geosearch', container);
        this.geosearchInput.id = 'address';
        this.geosearchInput.type = 'text';
        this.geosearchInput.placeholder = 'Search for location';
        $(this.geosearchInput).typeahead(null, {
            displayKey: 'description',
            source: control.addressPicker.ttAdapter()
        });

        $(this.geosearchInput).bind('typeahead:selected', this.options.locate);
        $(this.geosearchInput).bind('typeahead:cursorchanged', this.options.locate);

        return container;
    }
});

app.control.geoSearchControl = function(options) {
    return new app.control.GeoSearchControl(options);
};
