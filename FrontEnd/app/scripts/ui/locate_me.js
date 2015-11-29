'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.locateMe = app.ui.locateMe || {};

(function() {
    var panel = null;
    var button = null;
    this.init = function() {
        panel = $('#locate-me-panel');
        button = panel.find('.btn-locate-me');

        if (!navigator.geolocation) {
            panel.hide();
        }

        app.map.locateMe.on('locationChanged', function(latLng) {
            if (app.ui.layout.getActiveState() === 'list') {
                /* List view: zoom out so that all incidents can be displayed (Story 312 AC02) */
                /* Note that the locate control also sets the zoom. This duplication of zoom is wasteful of resources - try to improve this in future (i.e. prevent control's zoom). */
                app.map.showMe(latLng);
                app.ui.sidebar.sortFeatureList('sortDistance_asc');
            }
        });

        app.map.locateMe.on('stopped', function() {
            button.removeClass('active');
        });

        button.click(function() {
            app.map.locateMe.triggerStart();
            if (app.map.locateMe.isActive()) {
                app.map.locateMe.showSpinner();
                $(this).addClass('active');
            } else {
                app.map.locateMe.hideSpinner();
                $(this).removeClass('active');
            }
        });
    };
}).apply(app.ui.locateMe);
