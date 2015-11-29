'use strict';

/*
    feature toggle support

    Selectively enable/disable features at run time by using the query string.

    http://.../path/to/app?ft=feature1,feature2,!feature3&ft-off=feature4

    Turns on feature1, feature2
    Turns off feature 3 and feature 4
*/

var util = util||{};
util.feature = util.feature || {};

(function() {

    // initial default feature toggles
    this.toggles = {};

    this.set = function(name, enabled) {
        this.toggles[name] = enabled;
    };
    this.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    this.getQueryVariable = function(search, variable) {
        var query = search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    };

    this.processQueryArgs = function(search, key, enabled) {
        var val = this.getQueryVariable(search, key);
        if( val ) {
            val.split(',').forEach(function(v) {
                if( v.indexOf('!')===0 ) { //starts with !, invert
                    util.feature.set(v.substring(1), !enabled);
                } else {
                    util.feature.set(v, enabled);
                }
            });
        }
    };

    this.init = function (defaults) {
        this.toggles = defaults || {};

        // decode query string for 'ft' -- on
        this.processQueryArgs(window.location.search, 'ft',true);
        this.processQueryArgs(window.location.search, 'ft-on',true);

        // decode query string for 'ft-off' -- off
        this.processQueryArgs(window.location.search, 'ft-off',false);
    };

}).apply(util.feature);
