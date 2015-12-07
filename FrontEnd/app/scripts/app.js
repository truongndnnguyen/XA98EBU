'use strict';

/* globals util: false */

var app = app || {};
//var console = console || { log: function () { } };
//alert($(document).width() + "x" + $(document).height());
(function() {
    this.map = null;
    this.featureList = null;
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.apiBaseUrl = 'https://api.em-public.ci.devcop.em.vic.gov.au/dev';
    this.apiBaseUrl = document.location.href.indexOf('/qa/')>0? 'https://17o47gip83.execute-api.ap-northeast-1.amazonaws.com/dev/QA': 'https://17o47gip83.execute-api.ap-northeast-1.amazonaws.com/dev/LOCAL';
    this.apiBaseUrl = 'http://localhost:9002/LOCAL'

    this.init = function () {
        util.feature.init({
            isolatewarnings: false,
            isolateall: false,
            googleapi: true,
            qadata: false,
            testdata: false,
            localapi : false
        });

        app.initMap();
        var isMapExisting = true;
        app.ui.init(isMapExisting);
        app.data.init();
        app.ui.watchZone.init();
        if (util.feature.toggles.localapi) {
            app.apiBaseUrl = './api';
        }
    };

}).apply(app);
