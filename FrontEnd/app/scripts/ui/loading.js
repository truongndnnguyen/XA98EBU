'use strict';
var app = app || {};
app.ui = app.ui || {};
app.ui.loading = app.ui.loading || {};

(function () {
    this.loader = null;
    this.createLoader = function () {
        this.loader = $('<div id="loading" class="hide" >' +
            '   <img src="images/animated/Loading-000000-FFFFFF-96.gif" width="48" height="48" alt="Loading" />' +
            '</div>')
        this.loader.appendTo('body');
        return this.loader;
    }
    this.show = function (blockUI, blockElement) {
        this.loader = this.loader || this.createLoader();
        this.loader.removeClass("hide");

        if (blockUI) {
            $('<div class="ui-interactive-block"></div>').appendTo('body');
        }
    }
    this.hide = function () {
        $('.ui-interactive-block').remove();
        if (this.loader == null) return;
        this.loader.addClass("hide")
    }
    this.init = function () {

    };
}).apply(app.ui.loading);
