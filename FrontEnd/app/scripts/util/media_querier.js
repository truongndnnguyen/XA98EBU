'use strict';

var util = util||{};
util.mediaQuerier = util.mediaQuerier || {};

(function() {

    this.getHtml = function() {
        return '<div class="media-querier"></div>';
    };

    this.getMediaQuerierData = function() {
        var ret = $('.media-querier').css('width');
        return ret;
    };

    this.isMobileView = function() {
        var ret = this.getMediaQuerierData() === '100px';
        return ret;
    };

    this.isTabletView = function() {
        var ret = this.getMediaQuerierData() === '101px';
        return ret;
    };

    this.isDesktopView = function() {
        var ret = this.getMediaQuerierData() === '102px';
        return ret;
    };

}).apply(util.mediaQuerier);
