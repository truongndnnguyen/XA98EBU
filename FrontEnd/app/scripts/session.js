'use strict';

var app = app || {};
app.session = app.session || {};

(function() {
    this.watchZone = null;
    this.setWatchZone = function (obj) {
        if (obj == undefined || obj == null) {
            util.cookies.set('EMPUBLIC_SESSION_WATCHZONE', null, -1);
            return;
        }
        this.watchZone = obj;
        util.cookies.set('EMPUBLIC_SESSION_WATCHZONE', JSON.stringify(obj), 0)
    }

    this.init = function () {
        var watchZoneStr = util.cookies.get('EMPUBLIC_SESSION_WATCHZONE');

        if (watchZoneStr) {
            this.watchZone = JSON.parse(watchZoneStr)
        }
    }
}).apply(app.session);
