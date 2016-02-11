'use strict';

/** returns the version number of IE if Intrnet Explorer is used or FALSE otherwise.
*   source: http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
*/

var util = util||{};
util.detect = util.detect || {};

(function() {

    this.detectIE = function(userAgent) {
        var ua = userAgent || window.navigator.userAgent;

        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // IE 12 => return version number
            return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
    };

    /**  tells if the browser is the member of IE/Edge family or not
    */
    this.isIE = function() {
        return this.detectIE() !== false;
    };

    this.isFirefox = function() {
        var ua = window.navigator.userAgent;
        var ret = (ua.indexOf('Firefox') > 0 );
        return ret;
    }

}).apply(util.detect);
