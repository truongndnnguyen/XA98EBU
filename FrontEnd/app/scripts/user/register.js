'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.register = app.user.register || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    //this.dataURL = 'https://17o47gip83.execute-api.ap-northeast-1.amazonaws.com/dev/user';
    this.successMessage = $('#signup-successMessage');
    this.errorMessage = $('#signup-errorMessage');
    this.signupForm = $('#signup-form');
    this.termAndCondition = $("#term-condition");
    this.modal = $('#modalSignup')
    this.showTermAndCondition = function () {
        //this.termAndCondition.removeClass("hide");
        this.successMessage.addClass("hide");
        this.signupForm.addClass("hide");
        this.errorMessage.addClass("hide");
        app.user.toc.load(function (content, version) {
            $("#signup-toc-version").val(version);
            $("#term-condition").removeClass('hide').html(content);
            //$("#term-condition-agree").removeClass('hide');
            app.user.register.modal.addClass('emv-toc-modal');
        }, false);
    }
    this.init = function () {
        util.dom.applyValidationForIE('signup-form');

        this.dataURL = app.apiBaseUrl + '/user';
        this.signupForm.validator({ disable: false }).on('submit', function (e) {
            util.dom.validateSubmitForm('signup-form', e, function () {
                app.user.register.showTermAndCondition();
            });
            return false;
        });

        $("#modalSignup").on('show.bs.modal', function () {
            app.user.register.reset();
        })
        $("#modalSignup").on('hide.bs.modal', function () {
            app.user.login.show();
        })
        $("#term-condition-agree").click(function (e) {
            e.preventDefault();
            app.user.register.postForm();
        })
    };
    this.reset = function () {
        $('.form-group').removeClass('has-error');
        $('.form-group').find('.with-errors').html('');
        this.modal.removeClass('emv-toc-modal');
        this.errorMessage.addClass("hide");
        this.successMessage.addClass("hide");
        this.signupForm.removeClass("hide");
        this.termAndCondition.addClass("hide");
    }
    this.getUserFormInfo = function () {
        var userInfo = {
            'email': $("#signup-email").val(),
            'password': $("#signup-password").val(),
            'firstname': $("#signup-firstname").val(),
            'lastname': $("#signup-lastname").val(),
            'tocVersion' :$('#signup-toc-version').val()
        }
        return userInfo;
    }
    this.showWelcome = function (data) {
        this.successMessage.removeClass("hide");
        this.termAndCondition.addClass("hide");
        this.modal.removeClass('emv-toc-modal');
        this.signupForm.hide();
    }
    this.showError = function (data) {
        this.modal.removeClass('emv-toc-modal');

        if (data.code == 'emailExists') {
            var html = 'This email address is already associated with an account.';
            this.errorMessage.find('.message').html(html);
            this.errorMessage.find('a').click(function (e) {
                e.preventDefault();
                app.user.login.show($('#signup-email').val());
                //this.modal.modal('hide');
            })

        }
        else {
            this.errorMessage.find('.message').html(data.message)
        }
        this.errorMessage.removeClass("hide");
        this.termAndCondition.addClass("hide");
        this.signupForm.removeClass("hide");
        //$("#term-condition-agree").addClass('hide');
    }
    this.postForm = function () {
        var registerData = this.getUserFormInfo();
        util.api.post(this.dataURL,
            this.getUserFormInfo(),
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    app.user.register.showWelcome(data.result);
                }
                if (data.error) {
                    app.user.register.showError(data.error);
                }
            },
            function (data) {
            });
    }
}).apply(app.user.register);
