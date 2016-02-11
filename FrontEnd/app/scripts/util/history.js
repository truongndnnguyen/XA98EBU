'use strict';

var util = util||{};
util.history = util.history || {};

(function() {

    this.setFlag = function(name) {
        document.location.hash = name;
    };

    this.getFlag = function(name) {
        return document.location.hash === '#' + name;
    };

    this.hasPath = function() {
        return (document.location.hash !== null) && (document.location.hash.indexOf('#!') >= 0);
    };

    this.getPath = function() {
        if( ! this.hasPath() ) {
            return null;
        }
        return document.location.hash.substring(document.location.hash.indexOf('#!')+2);
    };

    this.setPath = function(path) {
        document.location.hash = '!' + path;
    };

    this.clearPath = function() {
        if( this.hasPath() ) {
            document.location.hash = '';
        }
    };

}).apply(util.history);
