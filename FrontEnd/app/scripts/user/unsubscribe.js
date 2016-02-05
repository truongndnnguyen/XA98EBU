'use strict';

/* globals util: false */

var app = app || {};
app.user = app.user || {};
app.user.unsubscribe = app.user.unsubcribe || {};

(function () {
    this.buildVersionTag = '$BUILD_VERSION_TAG';

    this.unsubscribeUrl = app.apiBaseUrl + '/user/unsubscribe';
    this.init = function () {
        var match = document.location.href.match(/\?unsubscribe=(.*)/);
        if (match) {
            var code = match[1];
            util.api.post(this.unsubscribeUrl,
                {userId:code},
                function (data) {
                    app.ui.loading.hide();
                    if (data.result) {
                        app.ui.messageBox.info({
                            message: 'You have successfully unsubscribed from notifications from VicEmergency. <br/><br/>Please Log in and change your settings to recieve them in the future.',
                            showClose: true,
                            onClose: function () {
                                document.location.href = app.ui.layout.getHomeURL();
                            }

                        });

                    }
                })
        }
    };
}).apply(app.user.unsubscribe);
