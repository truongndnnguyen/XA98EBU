'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.askSlowConnection = app.ui.askSlowConnection || {};

(function() {
    this.askSlowConnectionTimeoutSeconds = 5;  // after so many seconds the user is asked if they want to switch to the text-only version
    this.askSlowConnectionIfTimedOut = true;

    this.askSlowConnectionShow = function() {
        $('#loading').addClass('hide');  // the z-index of the modal layer is unable to cover the loader in the background so we have to hide it.
        $('#modal-general').show();
        var html = app.templates.modal['ask-slow-connection']();
        $('#modal-general .modal-general-container').html(html);
    };

    this.askSlowConnectionHide = function() {
        $('#modal-general').hide();
        $('#loading').removeClass('hide');
    };

    this.start = function() {
        app.ui.askSlowConnection.askSlowConnectionIfTimedOut = true;
        setTimeout(function() {
            if (app.ui.askSlowConnection.askSlowConnectionIfTimedOut) {
                app.ui.askSlowConnection.askSlowConnectionIfTimedOut = false;
                app.ui.askSlowConnection.askSlowConnectionShow();
                $('.modal-general-container .header .closer').on('click', function() {
                    app.ui.askSlowConnection.askSlowConnectionHide();
                });
            }
        }, 1000*app.ui.askSlowConnection.askSlowConnectionTimeoutSeconds);
    };

    this.stop = function() {
        app.ui.askSlowConnection.askSlowConnectionIfTimedOut = false;
    };
}).apply(app.ui.askSlowConnection);
