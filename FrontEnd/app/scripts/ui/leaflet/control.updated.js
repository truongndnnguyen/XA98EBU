'use strict';

var app = app || {};

app.UpdatedControl = L.Control.extend({
    options: {
        position: 'topright'
    },
    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._container = L.DomUtil.create('div', 'published-date-control');
        this._span = L.DomUtil.create('span', 'published-date-timestamp', this._container);
    },
    onAdd: function() {
        return this._container;
    },
    setDate: function(date) {
        this._span.innerHTML = 'Last updated on ' + date.format('mmm d, yyyy h:MM TT');
    }
});

app.updatedControl = function(options) {
    return new app.UpdatedControl(options);
};
