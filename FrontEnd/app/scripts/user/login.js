'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.login = app.user.login || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.errorMessage = $('#login-message');
    this.loginForm = $('#login-form');
    this.modal = $('#loginModal');

    this.init = function () {
        util.feature.init({
            isolatewarnings: false,
            isolateall: false,
            googleapi: true,
            qadata: false,
            testdata: false,
            localapi: false
        });
        if (util.feature.toggles.localapi) {
            app.apiBaseUrl = './api';
        }

        this.dataURL = app.apiBaseUrl + '/user/login';
        this.loginForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.login.postForm();
                return false;
            }
        })
        $("#login-update-toc").click(function (e) {
            e.preventDefault();
            //update tocVersion

            var data = {
                email: app.user.login.tempUserInfo.email,
                auth: app.user.login.tempUserInfo.auth,
                newTocVersion: app.user.toc.version
            };
            util.api.post(app.user.profile.apiUpdateProfileURL,
                data,
                function (data) {
                    if (data.result) {
                        app.user.profile.setProfile(app.user.login.tempUserInfo);
                        document.location.reload();
                        //set profile here
                    }
                },
                function () {
            });
        })
        $("#login-term-condition-decline").click(function (e) {
            e.preventDefault();
            if (confirm('Decline terms and conditions will suppend your account? are you sure?')) {
                app.user.login.declineTOC();
            }
        })

        if (util.feature.getParameterByName('login') == '1') {
            this.modal.modal('show');
        };

        //this.modal.on('hide.bs.modal', function () {
        //    app.user.login.show();
        //})

        app.user.register.init();
        app.user.profile.init();
        app.user.pwreset.init();
        app.user.toc.init();
        app.ui.messageBox.init();
    };
    this.declineTOC = function () {
        //message user, delete user account?
        var user = this.tempUserInfo;
        app.user.profile.deleteProfile({email: user.email, auth: user.auth});
    }
    this.show = function () {
        this.init();
        $("#loginModal").modal('show');
    }
    this.getUserFormInfo = function () {
        //TODO : User binder library to automatically bind property to object
        var userInfo = {
            'email': $('#signin-email').val(),
            'password': $('#signin-password').val()
        }
        return userInfo;
    }
    this.showError = function (data) {
        this.errorMessage.find('.message').html(data.Message)
        this.errorMessage.removeClass('hide');

    }
    this.login  = function(obj){
        this.postForm(obj, true);
    }
    this.setTempdata = function(obj) {
        this.tempUserInfo = obj;
    }
    this.postForm = function (obj, silent) {
        var formData = obj || this.getUserFormInfo();

        util.api.post(this.dataURL,
            formData,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    //set authenticated profile. should we ignore set profile before user accept new term & conditon?
                    var userInfo = {
                        auth: data.result.auth,
                        email: data.result.email,
                        firstname: data.result.firstname,
                        lastname: data.result.lastname,
                        rememberme: $('#signin-rememberme').is(':checked'),
                        tocVersion: data.result.tocVersion,
                        verified: data.result.verified,
                        watchZones: data.result.watchZones
                    };
                    app.user.login.setTempdata(userInfo);
                    var tocVersion = data.result.tocVersion;
                    if (tocVersion !== app.user.toc.version) {
                        app.user.toc.load(function (content, version) {
                            var tocPlaceholder = $('#login-toc-update-placeholder');
                            $('#login-form-placeholder').addClass('hide');
                            tocPlaceholder.find('p:first').html(content);
                            tocPlaceholder.removeClass('hide');
                            ///$('#login-update-toc').removeClass('hide');
                            $('#loginModal').addClass('emv-toc-modal')
                        },
                        false);
                    }
                    else {
                        app.user.profile.setProfile(userInfo);
                        if (!silent) {
                            var url = document.location.href;
                            url = url.replace(/login=1/i, '');
                            document.location.href = url;
                        }
                    }
                    //redirect
                }
                if (data.error) {
                    app.user.login.showError(data);
                }
            },
            function (data) {
                app.ui.loading.hide();
            },
            silent)
    }
}).apply(app.user.login);
