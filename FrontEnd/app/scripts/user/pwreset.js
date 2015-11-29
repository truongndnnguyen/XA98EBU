'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.pwreset = app.user.pwreset || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.errorMessage = $("#pw-reset-error-message");
    this.successMessage = $("#pw-reset-success-message");
    this.form = $('#pw-reset-form');
    this.modal = $('#modalResetPassword');
    this.reset = function () {
        this.errorMessage.addClass('hide');
        this.successMessage.addClass('hide');
        this.form.removeClass('hide');
        this.form.find('input').val('');
    }
    this.init = function () {
        this.dataURL = app.apiBaseUrl + '/user/pwreset';
        this.form.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.pwreset.postForm();
                return false;
            }
        });
        this.modal.on('hide.bs.modal', function () {
            app.user.login.show();
        })
        this.modal.on('show.bs.modal', function () {
            app.user.pwreset.reset();
        })
    };
    this.getFormData = function () {
        var formData = {
            'email': $("#reset-password-email").val(),
        }
        return formData;
    }

    this.success = function (data) {
        app.ui.loading.hide();
        if (data.result) {
            app.user.pwreset.successMessage.removeClass('hide');
            app.user.pwreset.errorMessage.addClass('hide');
            app.user.pwreset.form.addClass('hide');
            $('#reset-email-address').text($('#reset-password-email').val());
        }
        if (data.error) {
            app.user.pwreset.errorMessage.find('.message').html(data.error.message)
            app.user.pwreset.errorMessage.removeClass("hide");
        }
    }
    this.postForm = function () {
        util.api.post(this.dataURL,
            this.getFormData(),
            this.success,
            function(data){}
            );
    }
}).apply(app.user.pwreset);
