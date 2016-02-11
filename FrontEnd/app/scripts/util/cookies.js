/**
    util.cookies

    util.cookies.set(name, value, [days-valid])
        Sets a browser cookie 'name' to 'value'
        If 'days-valid' is not set, then defaults to 365 days
        If 'days-valid' is < 0, then is set as a session cookie (lost when browser restarts)

    util.cookies.get(name)
        Gets a browser cookie 'name'
        Returns the cookie value or null if not found

    util.cookies.getBoolean(name, defaultValue)
        Gets a browser cookie as a boolean value
        Returns the value of the cookie (=== 'true') or the default value if not found
*/

'use strict';

var util = util||{};
util.cookies = util.cookies || {};

(function () {

    this.safeName = function(name)  {
        return name.replace(/[^a-zA-Z0-9\-]/g, '');
    }
    this.set = function(name, value, days) {
        var expires;
        //days = days || 2; // default to 2 days
        if (days == null || days =='undefined') {
            days = 2;
        }
        if (days > 0) {
            /* Greater than zero: expire after number of days */
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }
        else if (days === 0) {
            /* Zero: session cookie */
            expires = '';
        }
        else {
            /* Less than zero: expire */
            expires = '; expires=Thu, 01-Jan-1970 00:00:01 GMT';
        }
        name = this.safeName(name);
        document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/';
    };

    this.get = function (name) {
        name = this.safeName(name);
        var nameEQ = encodeURIComponent(name) + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    };

    this.clearAll = function() {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var name = cookies[i].split('=')[0];
            if (name.match(/empublic-auth/g)) continue; //not delete identity infomation because it will cause logout.
            name = this.safeName(name);
            //name = name.replace(/^\s+|\s+$/g, '');
            this.set(name, '', -1);
        }
    };

    this.getBoolean = function(name,def) {
        var ret = this.get(name);
        if( ret === null ) {
            return def;
        }
        return ret === 'true';
    };

    this.getInteger = function(name, def) {
        var ret = this.get(name);
        if( (ret === null) || (ret === '') ) {
            return def;
        }
        return parseInt(ret) || def;
    };

}).apply(util.cookies);
