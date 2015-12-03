'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.profileUI = app.user.profileUI || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.successMessage = $("#profile-success-message");
    this.errorMessage = $("#profile-error-message");

    this.isAuthenticated = false;

    this.init = function () {
        this.changePWForm = $('#change-password-form');
        this.profileForm = $('#profile-form');
        app.user.profile.restoreProfile(function (profile) {
            app.ui.watchfilter.init();
            if (profile && profile.authenticated) {
                app.user.profileUI.initProfileForm(profile);
                app.user.profileUI.initChangePWForm(profile);

            }
            else {
                app.user.login.show();
            }
        });
    };

    this.initProfilePage = function () {
        var op = util.feature.getParameterByName("op");
        switch (op) {
            case 'profile':
                //this.showProfileForm();
                //this.initUpdatePasswordForm();
                break;
            default:
        }
    }
    this.showError = function (error, message) {
        message = message || error.code;
        this.errorMessage.find('.message').html(message)
        this.errorMessage.removeClass("hide");
        this.successMessage.addClass('hide');
    }

    this.postUpdateProfileForm = function () {
        app.user.profile.updateProfile(
            {
                firstname: $("#profile-firstname").val(),
                lastname: $("#profile-lastname").val(),
                email: $("#profile-email").val(),
            },
        function (data, isEmailChannged) {
            var message = app.templates.profile.message.update({ emailChanged: isEmailChannged });
            app.ui.messageBox.info({
                message: message,
                showClose: true
            })
        },
        function (err) {
            if (err.code == 'emailExists')
            {
                app.user.profileUI.showError(err, 'This email address is already associated with an account.');
            }
        });
    }

    this.initProfileForm = function (profile) {
        this.profileForm = $("#profile-form");

        if (profile && profile.authenticated) {
            $("#profile-email").val(profile.email);
            $("#profile-firstname").val(profile.firstname);
            $("#profile-lastname").val(profile.lastname);
        }
        this.profileForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.profileUI.postUpdateProfileForm();
                return false;
            }
        })
        $("#btn-delete-profile").click(function (e) {
            e.preventDefault();
            app.ui.messageBox.confirm('Are you sure you want delete your profile?', function () {
                app.user.profile.deleteProfile();
            })

        });
    }
    this.deleteProfile = function (currentUser) {
        var postData =currentUser || {
            auth: this.userProfile.auth,
            email: this.userProfile.email
        };
        util.api.post(this.apiDeleteProfileURL,
            postData,
            function (data) {
                var homeURL = app.ui.layout.getHomeURL();
                app.user.profile.logout(homeURL);//go to home page
            },
            function (data) {
                app.ui.loading.hide();
            });
    }

    this.initUpdatePasswordForm = function () {
        this.changePWForm.removeClass("hide");
        this.changePWForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.profile.updatePassword(true);
                return false;
            }
        })
    }

    this.initChangePWForm = function () {
        this.changePWForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.profile.updatePassword($("#change-password-password").val(),
                    function (data) {
                        app.ui.messageBox.info({
                            message: app.templates.profile.message.updatePassword(),
                            showClose:true
                        });
                });
                return false;
            }
        })
    }

}).apply(app.user.profileUI);
