'use strict';

var util = util||{};
util.api = util.api || {};

(function () {
    this.restRequest = function (method, url, data, success, error, hideLoading) {
        $.support.cors = true;
        data.rootUrl = app.ui.layout.getHomeURL();
        $.ajax({
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                Accept: 'application/json',
                //'origin-emv': $("#navbar-logo").prop('href').replace('/#', '')
                //"Access-Control-Allow-Origin": "*",
                //'Access-Control-Allow-Methods': "POST;GET"
            },
            type: method,
            url: url,
            data: JSON.stringify(data),
            beforeSend: function (xhr, setting) {
                if (hideLoading !== false) {
                    app.ui.loading.show();
                }
            },
            success: success,
            error: function (xhr, ajaxOptions, thrownError) {
                if (error) { error(); }
            },
            done: function () {
                app.ui.loading.hide();
            }
        });
    }
    this.post = function (url, data, success, error, hideLoading) {
        this.restRequest('post', url, data, success, error, hideLoading);
    }
    this.put = function (url, data, success, error, hideLoading) {
        this.restRequest('put', url, data, success, error, hideLoading);
    }
    this.get = function (url, success, error, hideLoading) {
        this.restRequest('get', url, null, success, error, hideLoading);
    }

}).apply(util.api);
