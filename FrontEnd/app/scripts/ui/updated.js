'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.updated = app.ui.updated || {};

(function() {
    this._element = null;

    this.setDate = function(/* date */) {
        if (this._element !== null) {
            // this._element.innerHTML = 'Last updated ' + date.format('mmm d, yyyy h:MM TT');
        }
    };

    this.init = function() {
        this._element = $('span#updated-date').get(0);
    };

}).apply(app.ui.updated);
