'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.pwchange = app.user.pwchange || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
        this.init = function () {
        this.errorMessage = $('#change-password-form-message');
        this.form = $('#change-password-form');
        this.modal = $('#pwchangeModal');

        this.dataURL = app.apiBaseUrl + '/user/update';
        //console.log('pwchange initialize.....')
        $('#change-password-form1').validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.pwchange.postForm();
                return false;
            }
        })
        //check hash?
        var hash = window.location.hash.substr(1);;
        if (hash === 'change-password'
            //&& app.user.profileManager.userProfile.authenticated
            ) {
            this.modal.modal('show');
        }

    };


    this.reset = function () {
        /* this.modal.removeClass('emv-toc-modal')
        $('#login-form-placeholder').removeClass('hide');
        $('#login-toc-update-placeholder').addClass('hide');
        */
    }

    this.showError = function (data) {
        this.errorMessage.find('.message').html(data.Message)
        this.errorMessage.removeClass('hide');
    }

    this.postForm = function (obj, silent) {
        var identity = app.user.profileManager.getUserIdentity();
        var formData = {
            newPassword: $('#change-password-password-txt').val()
        };
        var restData = $.extend(true, identity, formData);
        //console.log(restData);

        util.api.post(this.dataURL,
            restData,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    app.ui.messageBox.info({
                        message: 'You password has been updated.',
                        title: 'Success',
                        showClose: true,
                        onClose: function () {
                            app.user.pwchange.modal.modal('hide');
                        }
                    });
                }
            },
            function () { });

    };
}).apply(app.user.pwchange);
