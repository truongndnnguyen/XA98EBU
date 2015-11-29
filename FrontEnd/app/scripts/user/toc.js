'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.toc = app.user.toc || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.content = '';
    this.version = '';
    this.init = function () {
        var cachedVersion = util.cookies.get('empublic-toc-version');
        if (!cachedVersion) {
            this.load(function (content, version) {
                app.user.toc.cache(content, version);
            }, true)
        }
        else {
            this.cache('', cachedVersion);
        }
    };
    this.cache = function (content, version) {
        this.content = content;
        this.version = version;
        util.cookies.set('empublic-toc-version', version, 0);
    }
    this.load = function (callback, silent) {
        $.ajax({
            url: './statics/terms-and-conditions.html?' + (new Date()).getTime(),
            data: {},
            success: function (html) {
                if (!silent) {
                    app.ui.loading.hide();
                }
                var div = $("<div></div>").html(html);
                var content = div.find("#term-and-conditions").html();
                var version = div.find('meta[name="version"]').attr('content');
                if (callback) {
                    callback(content, version)
                }
            },
            error: function () {
            },
            beforeSend: function () {
                if (!silent) {
                    app.ui.loading.show();
                }
            }
        });
    }

}).apply(app.user.toc);
