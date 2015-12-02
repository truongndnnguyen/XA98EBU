'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.layout = app.ui.layout || {};
(function () {
    var forceRefreshInterval = 1000 *60 *15;
    var activeState = '';
    var mobileBreakpoint = 768;

    this.getHomeURL = function () {
        return $("#navbar-logo").prop('href').replace('/#', '');
    }
    this.getActiveState = function() {
        return activeState;
    };

    this.isMobileClient = function() {
        return document.body.clientWidth < mobileBreakpoint;
    };
    this.setSidebarState = function(state) {
        util.cookies.set('empublic-sidebar-state', state);
        this.setSidebarVisible(state);
    };

    this.setSidebarVisible = function(state) {
        var initialActiveState = activeState;
        var container = $('#container');
        var sidebar = container.find('#sidebar');
        var mobileToggleControlList = $('#mobile-sidebar-list-btn');
        var mobileToggleControlBoth = $('#mobile-sidebar-both-btn');
        var mobileToggleControlMap = $('#mobile-sidebar-map-btn');
        var activeMobileToggleControl = null;
        var refreshPanel = $('#refresh-panel').hide();

        this.setSidebarTextonly(false);
        container.removeClass('sidebar-opened sidebar-closed sidebar-expanded sidebar-collapsed');
        $('.hidden-app-all').hide();
        $('.visible-app-all').show();
        mobileToggleControlList.removeClass('active');
        mobileToggleControlList.find('span.sr-only').find('span.sr-selected').attr('aria-hidden', 'true');
        mobileToggleControlBoth.removeClass('active');
        mobileToggleControlBoth.find('span.sr-only').find('span.sr-selected').attr('aria-hidden', 'true');
        mobileToggleControlMap.removeClass('active');
        mobileToggleControlMap.find('span.sr-only').find('span.sr-selected').attr('aria-hidden', 'true');
        if( state === 'both' ) {
            activeState = 'both';
            container.addClass('sidebar-opened sidebar-collapsed');
            sidebar.attr('aria-hidden', 'false');
            activeMobileToggleControl = mobileToggleControlBoth;
            $('.hidden-app-both').hide();
            $('.visible-app-both').show();
            app.ui.sidebar.setVisible(true);
            $("#operation-bar, #emv-content").removeClass("map-only-view")
        } else if( state === 'map' ) {
            activeState = 'map';
            container.addClass('sidebar-closed');
            sidebar.attr('aria-hidden', 'true');
            activeMobileToggleControl = mobileToggleControlMap;
            $('.hidden-app-map').hide();
            $('.visible-app-map').show();
            app.ui.sidebar.setVisible(false);
            if (app.ui.layout.isMobileClient()) {
                $("#operation-bar, #emv-content").addClass("map-only-view")
            }
        } else if (state === 'list') {
            activeState = 'list';
            if( !app.ui.layout.isMobileClient() ) {
                this.setSidebarTextonly(true);
                $('.hidden-app-textonly').hide();
                $('.visible-app-textonly').show();
                $('.hidden-sort-list').hide();
            } else {
                container.addClass('sidebar-opened sidebar-collapsed');
                $("#operation-bar, #emv-content").removeClass("map-only-view")
                $('.hidden-app-list').hide();
                $('.visible-app-list').show();
                $('.hidden-sort-list').show();
            }
            sidebar.attr('aria-hidden', 'false');
            activeMobileToggleControl = mobileToggleControlList;
            refreshPanel.show();
            app.ui.sidebar.setVisible(true);
        }

        activeMobileToggleControl.addClass('active');
        activeMobileToggleControl.find('span.sr-only').find('span.sr-selected').attr('aria-hidden', 'false');

        app.map.invalidateSize();

        /* If switching from both/map to list or vica versa, clear location (Story 312 AC09/AC10) */
        if (app.map.locateMe.isActive()) {
            if (initialActiveState === 'list') {
                if (activeState === 'both' || activeState === 'map') {
                    app.map.locateMe.stop();
                }
            }
            else if (initialActiveState === 'both' || initialActiveState === 'map') {
                if (activeState === 'list') {
                    app.map.locateMe.stop();
                }
            }
        }
    };

    this.changeZoomLevel = function(zoom) {
        //change zoom level from text only screen
        var zoomElement = zoom.split('-');
        app.map.setZoom(zoomElement[1]);
    };

    this.setSidebarTextonly = function(state) {
        var $map = $('#map');

        var $container = $('#container');
        $container.removeClass('sidebar-opened sidebar-closed sidebar-expanded sidebar-collapsed');

        var featureListExpanded = $('.feature-list thead').find('.sidebar-expanded-only');
        var featureListCollapsed = $('.feature-list thead').find('.sidebar-collapsed-only');

        if( state ) {
            $map.attr('aria-hidden','true');
            $container.addClass('sidebar-opened sidebar-expanded');
            featureListCollapsed.attr('aria-hidden', 'true');
            featureListExpanded.attr('aria-hidden', 'false');
            app.ui.sidebar.showAllTabs();
        } else {
            $map.attr('aria-hidden','false');
            $container.addClass('sidebar-opened sidebar-collapsed');
            featureListCollapsed.attr('aria-hidden', 'false');
            featureListExpanded.attr('aria-hidden', 'true');
            app.ui.sidebar.showSingleTab();
        }
        app.ui.sidebar.setVisible(true);
    };

    // dynamic print handler, pass in div content to be printed and clear print content at the end of session
    this.preparePrint = function(content, interval) {
        //var printContentHTML = content.html();
        setTimeout(function () {
            var printContentHTML = content.html();
            $('#printable-section').html(printContentHTML);
        }, interval);
    };

    this.print = function() {
        window.print();
    };

    this.clearPrint = function() {
        $('#printable-section').empty();
    };

    this.init = function () {
        /* Restore persisted state of sidebar */

        /* setup page force reload after 15minutes */
        setTimeout(function () {
            document.location.reload();
        }, forceRefreshInterval);

        if( util.history.getFlag('textonly') ) {
            this.setSidebarVisible('list');
        } else {
            var state = util.cookies.get('empublic-sidebar-state') || 'both';
            if( (state === 'both') && app.ui.layout.isMobileClient() ) {
                state = 'list';
            }
            this.setSidebarVisible(state);
        }

        $('#sort-choice li a').click(function(e){
            e.preventDefault();
            $('#sortDropdownMenu').html('Sort <span class="caret"></span>');
        });

        $('#mobile-sidebar-list-btn').click(function() {
            app.ui.layout.setSidebarState('list');
        });
        $('#mobile-sidebar-map-btn').click(function() {
            app.ui.layout.setSidebarState('map');
        });
        $('#mobile-sidebar-both-btn').click(function() {
            app.ui.layout.setSidebarState('both');
        });

        $(document).on('ajaxStop', function() {
            $('#loading').hide();
        });

        $('.dropdown-menu').on('click', function(e){
            if($(this).hasClass('dropdown-menu-form')){
                e.stopPropagation();
            }
        });

        window.setInterval(function(){
            var $mapdiv = $('#map');
            if( $mapdiv.attr('aria-hidden') === 'true' ) {
                return;
            }
            if( ($mapdiv.height() !== app.map._size.y) || ($mapdiv.width() !== app.map._size.x) ) {
                app.map.invalidateSize();
            }
        },500);

        //Prevent URL change on click
        $('.no-url-change').click(function(event){
            event.preventDefault();
        });

        /*Adding class to selected sorting panel*/
        $('#sort-choice li a').click(function() {
            $('#sort-choice li a').removeClass('selectedSort');
            $(this).addClass('selectedSort');
        });

        /*Adding class to selected range panel*/
        $('#zoom-choice li a').click(function() {
            $('#zoom-choice li a').removeClass('selectedZoom');
            $(this).addClass('selectedZoom');
        });

        /* Clear cookies on navbar logo click */
        $('#navbar-logo').click(function() {
            util.cookies.clearAll();
            location.reload();
        });

        /* Accessible Bootstrap dropdown (open) */
        $(document).on('shown.bs.dropdown', function(event) {
            var dropdown = $(event.target);
            dropdown.find('.dropdown-menu').attr('aria-expanded', true);
            /* Set focus on the first link in the dropdown */
            setTimeout(function() {
                dropdown.find('.dropdown-menu li a.selectedSort, .dropdown-menu li a.selectedZoom, .dropdown-menu li a.desc, .dropdown-menu li:first-child a').focus();
                }, 10);
        });

        /* Accessible Bootstrap dropdown (close) */
        $(document).on('hidden.bs.dropdown', function(event) {
            var dropdown = $(event.target);
            dropdown.find('.dropdown-menu').attr('aria-expanded', false);
            /* Set focus back to dropdown toggle */
            dropdown.find('.dropdown-toggle').focus();
        });

        /*Detect window resize event*/
        var checkWindowWidth = document.body.clientWidth;
        $(window).resize(function () {
            if( !app.ui.layout.isMobileClient() ) {
                $('#filter-dropdown-btn').attr('data-toggle', 'dropdown');
                if( activeState === 'both' || activeState === 'list' ) {
                    if (checkWindowWidth < mobileBreakpoint) {
                        $('#mobile-sidebar-both-btn').focus();
                        app.ui.layout.setSidebarState('both');
                    }
                }
            } else {
                $('#filter-dropdown-btn').removeAttr('data-toggle').parent().removeClass('open');
                var searchTextBox = $('#typeahead-input');
                var focusCtr = $(':focus');
                if (focusCtr != null && (focusCtr.attr('type') == 'text' ||
                    focusCtr.attr('type') == 'email' ||
                    focusCtr.attr('type') == 'password')) {
                    return;

                }
                if(( activeState === 'both' || activeState === 'list') && !searchTextBox.is(':focus') ) {
                    $('#mobile-sidebar-list-btn').focus();
                    app.ui.layout.setSidebarState('list');
                }
            }
            app.ui.popup.updateFeatureModalBodyPosition(200, true);
            checkWindowWidth = document.body.clientWidth;
        });
    };

}).apply(app.ui.layout);
