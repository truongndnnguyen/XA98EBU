
'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.messageBox = app.ui.messageBox || {};
(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.modal = $("#modalMessageBox");
    this.confirmOK = $("#confirm-ok");

    this.centerModals = function ($element) {
        var $modals;
        if ($element && $element.length) {
            $modals = $element;
        } else {
            $modals = $('.modal-vcenter:visible');
        }
        $modals.each(function (i) {
            var $clone = $(this).clone().css('display', 'block').appendTo('body');
            var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
            top = top > 0 ? top : 0;
            $clone.remove();
            $(this).find('.modal-content').css("margin-top", top);
        });
    }

    this.init = function () {
        this.modal = $("#modalMessageBox");
        this.confirmOK = $("#confirm-ok");
        this.modal.on('show.bs.modal', function (e) {
            app.ui.messageBox.centerModals($(this));
        });
    };

    this.confirm = function (options) {
        var modal = modal = $("#modalMessageBox");
        modal.find('.messagebox-message').html(options.message);
        modal.find('.button-info').addClass('hide');

        $("#confirm-ok, .message-box-confirm").unbind('click').click(function () {
            if (options.onConfirm) {
                options.onConfirm();
            }
        })

        if (options.btnConfirm) {
            modal.find('.button-confirm').addClass('hide');
        }
        else {
            modal.find('.button-confirm').removeClass('hide');

        }
        $('.message-box-close').click(function () {

        })
        $("#modalMessageBox").modal('show');
    }

    this.info = function (infoObj) {
        var modal = modal = $("#modalMessageBox");
        modal.find('.messagebox-message').html(infoObj.message);
        modal.find('.emv-button').addClass('hide');
        modal.find('.button-info').removeClass('hide');
        modal.find('.button-confirm').addClass('hide');
        if (infoObj.showClose) {
            $("#info-close").removeClass('hide').click(function () {
                if (infoObj.onClose) {
                    infoObj.onClose();
                }
            })
        }
        $("#modalMessageBox").modal('show');
        this.centerModals()
    }

}).apply(app.ui.messageBox);
