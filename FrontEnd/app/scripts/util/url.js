'use strict';

var util = util||{};
util.url = util.url || {};

(function () {
    this.getRootUrl = function () {
        var homeURL = $("#navbar-logo").prop('href').replace('/#', '');
        return homeURL.replace('/respond','/')
    }

    this.redirect = function (url) {
        if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
            location.replace(url);
        }
        else {
            document.location = url;
            location = url;
        }
    }
    this.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    this.goTo = function (url, data) {
        var ele_form = document.createElement("FORM");
        ele_form.method = "POST";
        ele_form.id = 'dummy_form';
        ele_form.action = url;
        if (!!data) {
            for (key in data) {
                var dummy_ele = document.createElement('INPUT');
                dummy_ele.name = key;
                dummy_ele.value = data[key];
                dummy_ele.type = 'hidden';
                ele_form.appendChild(dummy_ele);
            }
        }
        document.getElementsByTagName('body')[0].append(ele_form);
        document.getElementById('dummy_form').submit();
    }

}).apply(util.url);
