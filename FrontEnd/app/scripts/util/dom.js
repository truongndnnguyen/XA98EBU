'use strict';

var util = util||{};
util.dom = util.dom || {};

(function () {
    //return false if not IE, return version number if IE
    this.ieVersion = function () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    this.responsiveElements = function(parent, elements, wrapper) {
        setTimeout(function() {
            $(parent).find(elements).each(function() {
                var $el = $(this);
                if(!$el.attr('original-w')) {
                    $el.attr('original-w', $el.width())
                    $el.attr('original-h', $el.height())
                }
                var originalW = parseInt($el.attr('original-w'));
                var w =$el.width();
                var parentW = Math.min(originalW,$(wrapper).width());
                var newH = $el.height() * (parentW/w);

                if(w > parentW) {
                    $el.width(parentW).height(newH);
                }
            })
        }, 100);
    };

    this.ensureExternalLinkStyles = function (placeholder) {
        setTimeout(function () {
            placeholder.find('.fa-external-link').remove();
            placeholder.find('a').each(function (index) {
                var hostname = document.location.host;
                var lnk = $(this).attr('href');

                if (!lnk.match(hostname)) {
                    var txtNode = $(this).contents().filter(function () { return this.nodeType === 3; });
                    var img = $(this).find('img');
                    $(this).attr('target', '_blank').addClass('external-link');
                    if (txtNode.length > 0) {
                        txtNode.after('<span class="fa fa-external-link" aria-hidden="true"></span>');
                    } else {
                        if (img.length == 0) {
                            $(this).append('<span class="fa fa-external-link" aria-hidden="true"></span>');
                        }
                    }
                }
            });
        }, 100);
    };

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

(function ($) {
    $.fn.hasScrollBar = function () {
        return this.get(0) ? this.get(0).scrollHeight > this.innerHeight() : false;
    }
})(jQuery);
