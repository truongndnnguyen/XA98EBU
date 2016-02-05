'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.profileManager = app.user.profileManager || {};
//this object will be refactor to ProfileManager . which is only do business login, no layouts stuff be implemented in here.

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';
    this.successMessage = $("#profile-success-message");
    this.errorMessage = $("#profile-error-message");
    this.userProfile = {};
    this.WATCH_ZONES_LIMIT_PER_USER = 20;
    this.isAuthenticated = false;

    this.init = function () {
        this.apiVerifyUrl = app.apiBaseUrl + '/user/verify';
        this.apiLoginUrl = app.apiBaseUrl + '/user/login';
        this.apiUpdateProfileURL = app.apiBaseUrl + '/user/update';
        this.apiDeleteProfileURL = app.apiBaseUrl + '/user/delete';

        $(".emv-logout-id").click(function (e) {
            e.preventDefault();
            app.user.profileManager.logout();
        })
        this.restoreProfile();
    };
    this.logout = function (redirectUrl) {
        this.userProfile = {};
        util.cookies.set('empublic-auth-identity', '', -1);
        util.cookies.set('empublic-auth-email', '', -1);
        util.cookies.set('empublic-auth-autologin', '', -1);
        util.cookies.set('empublic-auth-toc-version', '', -1);

        if (redirectUrl) {

            document.location.href = redirectUrl
        }
        else {
            //if current page is profile.html
            if (document.location.href.indexOf('/profile.html') > 0 ||
                document.location.href.indexOf('?change-password') ||
                document.location.href.indexOf('?login=1')){
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

            default:
        }
    }
    this.getUserIdentity = function() {
        return {
            auth: this.userProfile.auth,
            email: this.userProfile.email
        };
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
                app.user.profileManager.logout(homeURL);//go to home page
            },
            function (data) {
                app.ui.loading.hide();
            });
    }

    this.updateProfile = function (profile, success, err) {
        var current = app.user.profileManager.userProfile;
        var changedEmail = false;
        var profileData = {
            email: current.email,
            auth: current.auth,
            newFirstname: profile.firstname,
            newLastname: profile.lastname,
        };

        var newEmail = profile.email;

        if (newEmail.toLowerCase() != current.email.toLowerCase()) {
            profileData.newEmail = newEmail;
            changedEmail = true;
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
                    if (success) {
                        success(data.result, changedEmail);
                    }
                }
                if (data.error) {
                    if (err) {
                        err(data.error);
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

        this.userProfile = authenticatedUser;

        this.userProfile.authenticated = true;
        //allow auto login in 30 days
        var expiredDays = authenticatedUser.rememberme === true ? 30 : 0;
        util.cookies.set('empublic-auth-identity', authenticatedUser.auth, expiredDays);
        util.cookies.set('empublic-auth-email', authenticatedUser.email, expiredDays);
        if (authenticatedUser.rememberme === true) {
            util.cookies.set('empublic-auth-autologin', authenticatedUser.rememberme);
        }
        else {
            util.cookies.set('empublic-auth-autologin', false)
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
        var auth = util.cookies.get('empublic-auth-identity');
        var email = util.cookies.get('empublic-auth-email');
        var autologin = $.parseJSON(util.cookies.get('empublic-auth-autologin'));
        if (auth !== null && email !== null) {
            var data = { auth: auth, email: email };
            util.api.post(this.apiLoginUrl,
                data,
                function (data) {
                    app.ui.loading.hide();
                    if (data.result) {
                        app.user.profileManager.setProfile({
                            auth: data.result.auth,
                            email: data.result.email,
                            firstname: data.result.firstname,
                            lastname: data.result.lastname,
                            rememberme: autologin,
                            verified: data.result.verified,
                            watchZones: data.result.watchZones
                        });
                        app.ui.nav.updateProfileMenu(data.result);

                        //update body class - may need user this class to show/hide element on the page in the future.
                        app.ui.watchZone.addToList(app.user.profileManager.userProfile.watchZones);
                        app.ui.watchZone.restoreFromSession();
                        if (authenticatedCallback) {
                            authenticatedCallback(app.user.profileManager.userProfile)
                        }
                    }
                    if (data.error) {
                        app.ui.nav.updateProfileMenu(null);
                        if (authenticatedCallback) {
                            authenticatedCallback(app.user.profileManager.userProfile)
                        }
                    }
                },
                function (data) {
                    app.ui.nav.updateProfileMenu(null);
                    if (notAuthenticatedCallback) {
                        notAuthenticatedCallback(data)
                    }
                },
                true)
        }
        else {
            app.ui.nav.updateProfileMenu(null);
            if (notAuthenticatedCallback) {
                notAuthenticatedCallback()
            }
        }
    }

    this.updatePassword = function (password, success, err) {
        var data = {
            newPassword: password,
            auth: this.userProfile.auth,
            email: this.userProfile.email
        }
        util.api.post(this.apiUpdateProfileURL, data,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    if (success) {
                        success(data.result);
                    }
                }
                if (data.error && err) {
                    err(data.err);
                }
            },
            function() {}
            )
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
                app.user.profileManager.updatePassword();
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
        app.user.login.login(data, true, function (data) {
            if (data.result) {
                location.href = app.ui.layout.getHomeURL() + '/?change-password=1';
            }
            if (data.error) {
                $("#profile-idMessage").html(app.templates.register.message.profile.updatepassword(data));
                $("#profileMessage").modal('show');
            }
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
        this.userProfile.watchZones = newList;
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

            if (wz.id != itemid) {
                delete wz.id;
                postData.newWatchZones.push(wz);
            }
        }
        util.api.post(this.apiUpdateProfileURL,
            postData,
            function (data) {
                app.ui.loading.hide();

                if (data.result) {
                    var profile = app.user.profileManager.userProfile;
                    profile.watchZones = data.result.watchZones;
                    app.user.profileManager.setProfile(profile);

                    success(data,app.user.profileManager.userProfile.watchZones);
                }
                if (data.error) {
                    fail(data.error);
                }
            },
            function (data) { });
    }
    this.addOrUpdateWatchzone = function (watchzone, success, fail) {
        var wzList = this.userProfile.watchZones;
        if(watchzone.id) {
            for (var i = 0; i < wzList.length; i++) {
                if (wzList[i].id == watchzone.id) {
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
            newWatchZones: wzList,
        };

        util.api.post(this.apiUpdateProfileURL,
            postData,
            function (data) {
                app.ui.loading.hide();
                if (data.result) {
                    //update the list watch zone to usre profile.
                    app.user.profileManager.updateWatchZoneList(data.result.watchZones);
                    success(data, data.result.watchZones);
                }
            },
            function (data) {
                fail(data);
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
            if (list[i].id && list[i].id == id || list[i].name == id) {
                return list[i];
            }
        }
        return null;
    }
    /* Watch zones code */
}).apply(app.user.profileManager);
