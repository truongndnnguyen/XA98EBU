'use strict';

var util = util||{};
util.url = util.url || {};

(function() {
    this.redirect = function (url) {
        if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
            location.replace(url);
        }
        else {
            document.location = url;
            location = url;
        }
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
