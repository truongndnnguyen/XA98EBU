'use strict';

/* globals util: false */

var moreInfo = false;

var app = app || {};
app.ui = app.ui || {};
app.ui.popup = app.ui.popup || {};

(function() {

    this.init = function () {
        app.map.on('popupopen', function(evt) {
            if( evt.popup._source.feature ) {
                app.ui.selection.select(evt.popup._source.feature, true);
            }
        });
        app.map.on('popupclose', function(evt) {
            if( evt.popup.unbindOnClose ) {
                evt.popup.unbindPopup();
            }
            app.ui.selection.deselect();
        });
        /*Deselects modals on window so that the icon can be reselected*/
        $('#popupModal').on('hidden.bs.modal', function () {
            app.ui.selection.deselect();
            history.replaceState({}, document.title, document.location.href.split('#')[0]);
        });
        $('#featureModal').on('hidden.bs.modal', function () {
            if (document.body.clientWidth < 768) {
                app.ui.selection.deselect();
            }
        });
        /*Specific print rule for modal more info only*/
        $('.print-warning-page').on('click', function(e) {
            e.preventDefault();
            app.ui.layout.print();
        });
    };

    this.returnToList = function() {
        app.ui.layout.setSidebarState('list');
    };

    this.openPopupModal = function(feature, layer) {
        var cls = feature.classification;
        if( layer.getPopup && layer.getPopup() ) {
            $('#popup-info').html(layer.getPopup().getContent());
            $('#popupModal').modal('show');
        } else if(layer._popup ) {
            $('#popup-info').html(layer._popup.getContent());
            $('#popupModal').modal('show');
        } else if(layer._popupContent) {
            $('#popup-info').html(layer._popupContent);
            $('#popupModal').modal('show');
        }
        $('#osom-popup-details').on({
            click: function(event) {
                event.preventDefault();
                app.ui.popup.showPopupDetail(feature, cls, feature.latLng);
            }
        });
        $('.osom-popup-zoom').on({
            click: function(event) {
                event.preventDefault();
                $('#popupModal').modal('hide');
                app.ui.zoomToFeature(feature);
            }
        });
        if (app.ui.layout.getActiveState() === 'list') {
            $('#popupModal').one('click','.close', function(event) {
                event.preventDefault();
                app.ui.popup.returnToList();
            });
        }
    };

    //  attached popup info on map icon
    this.openPopup = function(feature, layer, alreadyOpen) {
        var cls = feature.classification;
        if(app.ui.layout.isMobileClient()) {
            if (cls.moreInformation && cls.majorIncidentLink) {
                var datahref = '#/'+feature.properties.feedType+'/'+feature.properties.id;
                app.ui.sidebar.openLocalPage(cls.majorIncidentLink, datahref);
            } else if( cls.moreInformation && !cls.moreInformationURL ) {
                app.ui.popup.setReturnToListButton(feature, cls, feature.latLng);
            } else {
                this.openPopupModal(feature, layer, alreadyOpen);
            }
        } else {
            if( ! alreadyOpen ) {
                if( layer.getBounds ) {
                    layer.openPopup(layer.getBounds().getCenter());
                } else {
                    layer.openPopup();
                }
            }

            /* Accessibility: set focus on popup when opened */
            if (layer && layer._popup && layer._popup._container &&
                (layer._popup._container !== null) && layer._popup._container.focus) {
                layer._popup._container.focus();
            }

            $('#osom-popup-details').on({
                click: function(event) {
                    event.preventDefault();
                    app.ui.popup.showPopupDetail(feature, cls, feature.latLng);
                }
            });
            $('.osom-popup-zoom').on({
                click: function(event) {
                    event.preventDefault();
                    app.ui.zoomToFeature(feature);
                }
            });
            $('.osom-popup-major-link').on({
                click: function(event) {
                    event.preventDefault();
                    var datahref = '#/'+feature.properties.feedType+'/'+feature.properties.id;
                    app.ui.sidebar.openLocalPage($(this).attr('href'), datahref);
                }
            });
        }
    };

    this.updateFeatureModalBodyPosition = function(interval, checkVisible){
        //need a delay time to wait browser render element
        if (document.body.clientWidth < 768) {
            var featureModal = $('#featureModal');
            if (!checkVisible || featureModal.is(':visible')) {
                if (interval === null) {
                    interval = 200;
                }
                setTimeout(function () {
                    var modalHeader = featureModal.find('.modal-header');
                    featureModal.find('.modal-body').css('top', modalHeader.outerHeight());
                }, interval);
            }
        }
    };

    //  attached icon attributes to each marker popup
    this.showPopupDetail = function (feature, cls) {
        app.ui.selection.select(feature);
        app.ui.popup.deepLinkMoreInfo(feature);
        $('#feature-title').html('<div class="warning-icon">' + util.symbology.getIcon(cls.iconClass) + '</div><div class="warning-title">' + cls.title + '</div>');
        $('#moreInfoModalHeader').addClass('osom-border-radius osom-subheader-' + cls.iconClass);
        //$('#feature-title').html(cls.title);
        var template = app.templates.panel[cls.template] || app.templates.panel.other;
        /* Set feature popup HTML and set all links to open in new tab */
        $('#feature-info').html(template(feature)).find('a').attr('target', '_blank');

        $('#featureModal').find('.modal-header').attr('class','modal-header');
        if (feature.classification.alertClass !== '') {
            $('#featureModal').find('.modal-header').addClass(feature.classification.alertClass);
        }

        //setup share button.
        var encodedUrl = encodeURIComponent(document.location.href);
        var title = cls.title + ' - ' + cls.location;
        if (cls.template === 'warning') {
            $('#featureModal').find('.social-share').removeClass('hide');
        } else {
            $('#featureModal').find('.social-share').addClass('hide');
        }
        $('#featureModal').find('.st_facebook_large').attr('href', 'https://www.facebook.com/sharer/sharer.php?u=' + this.getOpenGraphURL(cls.deeplinkurl));
        $('#featureModal').find('.st_twitter_large').attr('href', 'https://twitter.com/intent/tweet?text=' + title + '%0A' + encodedUrl);

        $('#featureModal').on('show.bs.modal', function (e) {
            app.ui.popup.updateFeatureModalBodyPosition(500, false);
            app.ui.layout.preparePrint($('#featureModal'),750);
        });
        $('#featureModal').on('hide.bs.modal', function () {
            app.ui.layout.clearPrint();
        });
        $('#featureModal').modal('show');
        $('.osom-popup-zoom').on({
            click: function(event) {
                event.preventDefault();
                app.ui.zoomToFeature(feature);
                if (app.ui.layout.getActiveState() === 'list') {
                    $('#mobile-sidebar-both-btn').trigger('click');
                }
            }
        });
    };

    this.setReturnToListButton = function(feature, cls) {
        if (app.ui.layout.getActiveState() === 'list') {
            $('#featureModal').one('click','.close', function(event) {
                event.preventDefault();
                app.ui.popup.returnToList();
            });
        }
        app.ui.layout.setSidebarVisible('map');
        app.ui.popup.showPopupDetail(feature, cls);
    };

    this.deepLinkMoreInfo = function(feature) {
        //add moreinfo link to url
        var addedurl = '/moreinfo';
        util.history.setPath(feature.classification.deeplinkurl+addedurl);
        //remove more info url when feature modal is closed or entire url in mobile view
        $('#featureModal').on('hidden.bs.modal', function () {
            if (document.body.clientWidth < 768) {
                history.replaceState({}, document.title, document.location.href.split('#')[0]);
            } else {
                util.history.setPath(feature.classification.deeplinkurl);
            }
            moreInfo = false;
        });
    };

    this.getOpenGraphURL = function(deepLinkURL) {
        /* IE doesn't have window.location.origin, so construct it manually */
        var origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        return origin + '/public/event' + encodeURIComponent(deepLinkURL) + '.html';
    };

}).apply(app.ui.popup);
