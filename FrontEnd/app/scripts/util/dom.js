'use strict';

var util = util||{};
util.dom = util.dom || {};

(function () {
    //return false if not IE, return version number if IE
    this.ieVersion = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
    this.validateSubmitForm = function (formId, e, doSubmitCB) {
        var ie8 = this.ieVersion() == 8;
        if (ie8) {
            var domForm = document.getElementById(formId);
            var valid = domForm.checkValidity && domForm.checkValidity();
            if (valid) {
                doSubmitCB();
                e.preventDefault(e);
                return false;
            }
        }

        if (e.isDefaultPrevented()) {
            e.preventDefault(e);
            return false;
        }
        else {
            e.preventDefault(e);
            doSubmitCB();
            return false;
        }
    }
    this.applyValidationForIE = function (formid) {
        var ie8 = this.ieVersion() == 8;
        if (ie8) {
            if (formid && Object.prototype.toString.call(formid) === '[object Array]') {
                for (var i = 0; i < formid.length; i++) {
                    alert(formid[i])
                    var el = document.getElementById(formid[i]);
                    if (el) {
                        H5F.setup(el);
                    }
                }
            }
            else {
                var el = document.getElementById(formid);
                if (el) {
                    H5F.setup(el);
                }
            }
        }
    }
}).apply(util.dom);
