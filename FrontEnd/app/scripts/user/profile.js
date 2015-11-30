'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.profile = app.user.profile || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.successMessage = $("#profile-success-message");
    this.errorMessage = $("#profile-error-message");
    this.userProfile = {};
    this.WATCH_ZONES_LIMIT_PER_USER = 20;
    this.init = function () {
        this.apiVerifyUrl = app.apiBaseUrl + '/user/verify';
        this.apiLoginUrl = app.apiBaseUrl + '/user/login';
        this.apiUpdateProfileURL = app.apiBaseUrl + '/user/update';
        this.apiDeleteProfileURL = app.apiBaseUrl + '/user/delete';

        $(".emv-logout-id").click(function (e) {
            e.preventDefault();
            app.user.profile.logout();
        })
        this.restoreProfile();
    };
    this.logout = function (redirectUrl) {
        this.userProfile = {};
        util.cookies.set('empublic-identity', '', -1);
        util.cookies.set('empublic-email', '', -1);
        util.cookies.set('empublic-autologin', '', -1);
        util.cookies.set('empublic-toc-version', '', -1);

        if (redirectUrl) {

            document.location.href = redirectUrl
        }
        else {
            //if current page is profile.html
            if (document.location.href.indexOf('/profile.html') > 0) {
                document.location.href = app.ui.layout.getHomeURL();
            }
            else {
                document.location.reload();
            }
        }
    }
    this.initProfilePage = function () {
        var op = util.feature.getParameterByName("op");
        this.changePWForm = $('#change-password-form');
        this.profileForm = $('#profile-form');

        switch (op) {
            case 'verify':
                this.activateUser();
                break;
            case 'pwreset':
                this.resetPassword();
                break;
            case 'profile':
                this.showProfileForm();
                this.initUpdatePasswordForm();
                break;
            default:
        }
    }

    this.showProfileForm = function () {
        var profileForm = $("#profile-form");
        this.restoreProfile(
            function (profile, form) {
                if (profile && profile.authenticated) {
                    app.user.profile.profileForm.removeClass('hide');
                    $("#profile-email").val(profile.email);
                    $("#profile-firstname").val(profile.firstname);
                    $("#profile-lastname").val(profile.lastname);
                }
                else {
                    app.user.login.show();
                }
            },
            function () {
                app.user.login.show();
            });
        profileForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.profile.postUpdateProfileForm();
                return false;
            }
        })
        $("#btn-delete-profile").click(function (e) {
            e.preventDefault();
            //replace by better confirmation layouts
            app.ui.messageBox.confirm('Are you sure you want delete your profile?', function () {
                app.user.profile.deleteProfile();
            })
            //if (confirm('Are you sure you want delete your profile?')) {
            //    app.user.profile.deleteProfile();
            //}
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

    this.postUpdateProfileForm = function () {
        var profile = app.user.profile.userProfile;
        var profileData = {
            email: profile.email,
            auth: profile.auth,
            newFirstname: $('#profile-firstname').val(),
            newLastname: $('#profile-lastname').val(),
        };
        var emailChangeHTML = '';

        var newEmail = $("#profile-email").val();
        if (newEmail.toLowerCase() != profile.email.toLowerCase()) {
            profileData.newEmail = newEmail;
            emailChangeHTML = "<br/><br/> An email has been sent to your new email address. Please check your email address to confirm new email address."
        }

        //var password = $('#profile-password').val();
        //if (password.length > 0) {
        //    profileData.newPassword = password;
        //}

        util.api.post(this.apiUpdateProfileURL,
            profileData,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    //app.user.profile.showSuccess(data, 'you profile has been updated.')
                    app.ui.messageBox.info({
                        message: 'Your profile has been updated.' + emailChangeHTML,
                        showClose:true
                    })
                    app.user.profile.errorMessage.addClass('hide'); //clean this code after implement final design.
                }
                if (data.error) {
                    if (data.error.code == 'emailExists') {
                        app.user.profile.showError(data, 'This email address is already associated with an account.');
                    }
                    else {
                        app.user.profile.showError(data, 'An error occured during save data');
                    }
                }
            },
            function () {
                app.ui.loading.hide();
            })
    }
    //authenticatedUser is assume hold auth + email
    //{
    //  auth: token
    //  email: email
    //}
    this.setProfile = function (authenticatedUser) {
        if (!authenticatedUser.watchZones) {
            authenticatedUser.watchZones = [];
        }
        authenticatedUser.watchZones = util.uuid.set(authenticatedUser.watchZones);

        this.userProfile = authenticatedUser;

        this.userProfile.authenticated = true;
        //allow auto login in 30 days
        var expiredDays = authenticatedUser.rememberme === true ? 30 : 0;
        util.cookies.set('empublic-identity', authenticatedUser.auth, expiredDays);
        util.cookies.set('empublic-email', authenticatedUser.email, expiredDays);
        if (authenticatedUser.rememberme === true) {
            util.cookies.set('empublic-autologin', authenticatedUser.rememberme);
        }
        else {
            util.cookies.set('empublic-autologin', false)
        }

    }
    this.acceptTOC = function (data, callback) {
        var data = {
            email: this.userProfile.email,
            auth: this.userProfile.auth,
            newTocVersion: version
        };
        util.api.post(this.apiUpdateProfileURL,
            data,
            function (data) {
                //Any addition login code here?
                callback(data);
            },
            function () {
            });
    }

    this.restoreProfile = function (authenticatedCallback, notAuthenticatedCallback) {
        var auth = util.cookies.get('empublic-identity');
        var email = util.cookies.get('empublic-email');
        var autologin = $.parseJSON(util.cookies.get('empublic-autologin'));
        if (auth !== null && email !== null) {
            var data = { auth: auth, email: email };
            util.api.post(this.apiLoginUrl,
                data,
                function (data) {
                    app.ui.loading.hide();
                    if (data.result) {
                        $('#user-profile').attr('data-toggle', 'dropdown').removeAttr('data-target');
                        name = data.result.firstname;
                        if (/^\s*$/.test(name)) {
                            name = 'User';
                        };

                        $('#user-profile').html(name);
                        app.user.profile.setProfile({
                            auth: data.result.auth,
                            email: data.result.email,
                            firstname: data.result.firstname,
                            lastname: data.result.lastname,
                            rememberme: autologin,
                            verified: data.result.verified,
                            watchZones: data.result.watchZones
                        });
                        //update body class - may need user this class to show/hide element on the page in the future.
                        app.ui.watchZone.addToList(app.user.profile.userProfile.watchZones);
                        $("body").addClass('emv-authenticated');
                        if (authenticatedCallback) {
                            authenticatedCallback(app.user.profile.userProfile)
                        }
                        if (!data.result.verified) {
                            $("body").addClass('emv-authenticated-not-verified');
                        }
                    }
                    if (data.error ) {
                        if (authenticatedCallback) {
                            authenticatedCallback(app.user.profile.userProfile)
                        }
                    }
                },
                function (data) {
                    if (notAuthenticatedCallback) {
                        notAuthenticatedCallback(data)
                    }
                },
                true)
        }
        else {
            if (notAuthenticatedCallback) {
                notAuthenticatedCallback(data)
            }
        }
    }

    this.updatePassword = function (isUpdated) {
        var data = {
            newPassword: $("#change-password-password").val(),
            auth: this.userProfile.auth,
            email: this.userProfile.email
        }
        util.api.post(this.apiUpdateProfileURL, data,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    if (isUpdated) {

                        app.ui.messageBox.info({
                            message: 'You password has been changed.',
                            title: 'Success',
                            showClose: true,
                        })
                    }
                    else {
                        $("#profile-idMessage").html(app.templates.register.message.profile.updatepassword(data));

                        $("#profileMessage").modal('show');
                    }

                }
                if (data.error) {
                    //app.user.profile.showError(data.error)
                }
            },
            function() {}
            )
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
    this.initPWResetForm = function (data) {
        this.setProfile({
            auth: data.auth,
            email: data.email,
            rememberme: false,
        })
        this.changePWForm.removeClass("hide");
        this.changePWForm.validator({ disable: false }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.user.profile.updatePassword();
                return false;
            }
        })
    }
    this.resetPassword = function () {
        var token = util.feature.getParameterByName("token");
        var email = util.feature.getParameterByName("email");
        var data = {
            token: token,
            email: email
        };
        util.api.post(this.apiLoginUrl,
            data,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    app.user.profile.initPWResetForm(data.result);
                }
                if (data.error) {
                    $("#profile-idMessage").html(app.templates.register.message.profile.updatepassword(data));
                    $("#profileMessage").modal('show');

                    //app.user.profile.showError(data.error)
                }
            },
            function (data) {
            });
    }

    this.showSuccess = function (data, message) {
        this.successMessage.removeClass('hide');
        this.errorMessage.addClass('hide')
        this.successMessage.find('.message').html(message);
        this.changePWForm.addClass("hide");
    }
    this.showError = function (error, message) {
        message = message || error.code;

        this.errorMessage.find('.message').html(message)
        this.errorMessage.removeClass("hide");
        this.successMessage.addClass('hide');
    }
    this.activateUser = function () {
        var token = util.feature.getParameterByName("token");
        var email = util.feature.getParameterByName("email");
        var data = {
            code: token,
            email : email
        };
        util.api.post(this.apiVerifyUrl,
            data,
            function (data) {
                app.ui.loading.hide();
                $("#profile-idMessage").html(app.templates.register.message.profile.active(data));
                $("#profileMessage").modal('show');
            },
            function () {
            }
        );
    }
    /*Watch zones code  logic/data access/ rules*/
    //this function to refresh lis watchzone on memory
    this.updateWatchZoneList = function (newList) {
        this.userProfile.watchZones = util.uuid.set(newList);
        app.ui.watchZone.addToList(this.userProfile.watchZones);
    }
    this.deleteWatchzone = function (itemid, success, fail) {
        var postData = {
            email: this.userProfile.email,
            auth: this.userProfile.auth,
            newWatchZones: [],
        };

        for (var i = 0; i < this.userProfile.watchZones.length; i++) {
            var wz = this.userProfile.watchZones[i];

            if (wz.uuid != itemid) {
                delete wz.uuid;
                postData.newWatchZones.push(wz);
            }
        }
        util.api.post(this.apiUpdateProfileURL,
            postData,
            function (data) {
                app.ui.loading.hide();

                if (data.result) {
                    var profile = app.user.profile.userProfile;
                    profile.watchZones = data.result.watchZones;
                    app.user.profile.setProfile(profile);

                    success(data,app.user.profile.userProfile.watchZones);
                }
                if (data.error) {
                    fail(data.error);
                }
            },
            function (data) { });
    }
    this.addOrUpdateWatchzone = function (watchzone, success, fail) {
        var wzList = this.userProfile.watchZones;
        if(watchzone.uuid) {
            for (var i = 0; i < wzList.length; i++) {
                if (wzList[i].uuid == watchzone.uuid) {
                    wzList[i] = watchzone;
                    break;
                }
            }
        }
        else
            wzList.push(watchzone);


        var postData = {
            email: this.userProfile.email,
            auth: this.userProfile.auth,
            newWatchZones: util.uuid.unSet(wzList),
        };

        util.api.post(this.apiUpdateProfileURL,
            postData,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    //update the list watch zone to usre profile.
                    app.user.profile.updateWatchZoneList(data.result.watchZones);
                    success(data);
                }
            },
            function (data) {
                fail();
            }
            );
    }

    this.canAddWatchZone = function () {
        if (this.userProfile.watchZones &&
            this.userProfile.watchZones.length >= this.WATCH_ZONES_LIMIT_PER_USER) {
            return false;
        }
        return true;
    }
    this.findWatchZone = function (id) {
        var list = this.userProfile.watchZones;
        if (!list || list.length == 0) return null;

        for (var i = 0; i < list.length ; i++) {
            if (list[i].uuid && list[i].uuid == id) {
                return list[i];
            }
        }
        return null;
    }
    /* Watch zones code */
}).apply(app.user.profile);
