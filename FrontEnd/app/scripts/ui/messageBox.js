'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.messageBox = app.ui.messageBox || {};
(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.modal = $("#modalMessageBox");
    this.confirmOK = $("#confirm-ok");

    this.init = function () {
        this.modal = $("#modalMessageBox");
        this.confirmOK = $("#confirm-ok");
    };

    this.confirm = function (message, ok, decline) {
        var modal = modal = $("#modalMessageBox");
        modal.find('.messagebox-message').html(message);
        modal.find('.emv-button').addClass('hide');
        modal.find('.button-confirm').removeClass('hide');
        $("#confirm-ok").unbind('click').click(function () {
            ok();
        })
        $("#modalMessageBox").modal('show');
        //this.modal.modal('show');
    }

    this.info = function (infoObj) {
        var modal = modal = $("#modalMessageBox");
        modal.find('.messagebox-message').html(infoObj.message);
        modal.find('.emv-button').addClass('hide');
        modal.find('.button-info').removeClass('hide');
        if (infoObj.showClose) {
            $("#info-close").removeClass('hide').click(function () {
                console.log('onclose popup')

                if (infoObj.onClose) {
                    infoObj.onClose();
                }
            })
        }
        $("#modalMessageBox").modal('show');
    }

}).apply(app.ui.messageBox);
