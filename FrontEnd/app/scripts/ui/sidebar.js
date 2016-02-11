'use strict';

/* globals util: false */
/* globals List: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.sidebar = app.ui.sidebar || { sortRule: { warning: { field: 'sortFeatureName', order: 'desc' }, incident: { field: 'sortUpdated', order: 'desc' } }, lastScrollTop : 0 };
(function () {
    this.clearHighlightPanel = function() {
        $('.feature-row').removeClass('selectedPanel');
    };
    this.getActiveTab = function() {
        var activeTab = $("#tab-content").find("div.active");
        return activeTab.attr('list-type');
    }
    this.showTab = function (tabType) {
        this.activeTab = tabType;
        if( tabType === 'warning' ) {
            $('#feature-list-tab-link-0').tab('show');
        } else {
            $('#feature-list-tab-link-1').tab('show');
        }
    };
    this.setScroll = function () {
        this.lastScrollTop = this.tabContent.scrollTop();
    };

    this.scrollIntoView = function (tableRow) {
        if (this.lastScrollTop > 0) {
            this.tabContent.scrollTop(this.lastScrollTop)
        }
        else {
            tableRow.scrollIntoView();
        }
        var panelHeight = this.tabContent.height();
        //If current item out of view, set current item to the top of panel, it  happen when the list change number of item after refresh.
        if (tableRow.position().top <= 0 || tableRow.position().top > panelHeight - tableRow.height()) {
            tableRow.scrollIntoView();
            this.setScroll();
        }
    }
    //  highlights panel item for the icon that was last clicked
    this.highlightPanel = function (feature) {
        this.clearHighlightPanel();
        this.showTab(feature.properties.feedType);

        //  prevents either table from disappearing in list mode
        if (app.ui.layout.getActiveState() === 'list' && !app.ui.layout.isMobileClient()) {
            app.ui.sidebar.showAllTabs();
        }

        // lookup by L.stamp(id)
        var layer = feature.layer || (feature.extendedFeature ? feature.extendedFeature.layer : null);
        var tableRow = null;
        if( layer ) {
            var id = L.stamp(layer);
            tableRow = $('#' + id);
            if (tableRow.length) {
                setTimeout(function () {
                    app.ui.sidebar.clearHighlightPanel();
                    tableRow.addClass('selectedPanel');
                }, 0);
                this.scrollIntoView(tableRow)
                //tableRow.scrollIntoView();
                this.highlightedPanelId = id;
                return;
            }
        }
        // lookup by deeplinkurl
        var deeplinkurl = feature.classification.deeplinkurl;
        if( deeplinkurl ) {
            tableRow = $('.sidebar-table').find('tr[data-href="#' + deeplinkurl + '"]');
            if( tableRow.length ) {
                tableRow.addClass('selectedPanel');
                tableRow[0].scrollIntoView();
                this.highlightedPanelId = tableRow[0].id;
                return;
            }
        }
    };

    this.openLocalPage = function(url, id) {
        util.cookies.set('local-page-id', id);
        window.open(url, '_blank');
    }

    this.createSidebarLayerRow = function(layer) {
        // hack to deal with mulitple layers per feature
        layer.feature.layer = layer;
        var template = app.templates.sidebar[layer.feature.classification.sidebarTemplate];
        template = template || app.templates.sidebar.other;
        var tableRow = $(template(layer.feature));

        tableRow.find('div.sidebar-feature-link').click(function(e) {
            e.preventDefault();
            var localLink = $(this).next().find('a.sidebar-major-link');
            if (!app.ui.layout.isMobileClient() || localLink.length === 0) {
                var cls = layer.feature.classification;
                app.ui.sidebar.setScroll();
                if ((cls.moreInformation && !cls.moreInformationURL) && document.body.clientWidth < 768) {
                    app.ui.popup.setReturnToListButton(layer.feature, layer.feature.classification, layer.feature.latLng);
                } else {
                    app.ui.selection.toggle(layer.feature);
                }
            }
        });

        tableRow.find('a.osom-table-popup-details, a.sidebar-majormoreinfo-click').click(function () {
            if (document.body.clientWidth < 768) {
                app.ui.popup.setReturnToListButton(layer.feature, layer.feature.classification, layer.feature.latLng);
            } else {
                app.ui.popup.showPopupDetail(layer.feature, layer.feature.classification, layer.feature.latLng);
                //update arrow icon
                var btnExpand = $(this).parent().parent().find('a.osom-table-expand-row');

                if (btnExpand !== null && btnExpand !== 'undefined') {
                    btnExpand.attr('expanded', 'true');
                }
            }
            return false;
        });

        /*Makes row clickable in list view if item contains more info or link*/
        tableRow.click(function(e) {
            e.preventDefault();
            var actionLink = $(this).find('.listViewAction').find('a:first');
            if (actionLink.length > 0 && app.ui.layout.getActiveState() === 'list') {
                if (actionLink.hasClass('sidebar-major-link')) {
                    app.ui.sidebar.openLocalPage(actionLink.attr('href'), actionLink.closest('.feature-row').attr('data-href'));
                } else {
                    if(actionLink.hasClass('osom-table-popup-details')) {
                        actionLink.trigger('click');
                    } else{
                        window.open(actionLink.attr('href'), '_blank');
                    }
                }
            }
        });
        tableRow.find('a.osom-table-expand-row').click(function () {
            if( document.body.clientWidth < 768 ) {
                var button = $(this);
                if (button.attr('expanded') === 'false') {
                    app.ui.sidebar.highlightPanel(layer.feature);
                    button.attr('expanded', true);
                }
                else {
                    button.attr('expanded', false);
                    app.ui.sidebar.clearHighlightPanel();
                }
            } else {
                app.ui.selection.toggle(layer.feature);
            }
            return false;
        });

        tableRow.find('a.sidebar-more-link').click(function (ev) {
            ev.preventDefault();
            window.open($(this).attr('href'));
        });

        tableRow.find('a.sidebar-major-link').click(function (e) {
            e.preventDefault();
            if (!app.ui.layout.isMobileClient()) {
                app.ui.sidebar.openLocalPage($(this).attr('href'), $(this).closest('.feature-row').attr('data-href'));
            }
        });
        return tableRow;
    };
    this.loadSortCookie = function() {
        var cookieWarning = util.cookies.get('empublic-warning-sort') || 'sortFeatureName_desc';
        var cookieIncident = util.cookies.get('empublic-incident-sort') || 'sortUpdated_desc';
        return {
            warning: {
                field: cookieWarning.substring(0, cookieWarning.indexOf('_')),
                order: cookieWarning.substring(cookieWarning.indexOf('_') + 1)
            },
            incident: {
                field: cookieIncident.substring(0, cookieIncident.indexOf('_')),
                order: cookieIncident.substring(cookieIncident.indexOf('_') + 1)
            },
        };
    };

    this.getFeatureById = function(id) {
        var feature = null;
        app.data.visitVisibleLayers(function(layer){
            if( L.stamp(layer) === id ) {
                feature = layer.feature;
            }
        });
        return feature;
    };

    this.syncTimeout = null;
    this.sync = function(reloaded) {
        if( this.syncTimeout ) {
            clearTimeout(this.syncTimeout);
        }
        this.syncTimeout = setTimeout(function(){
            app.ui.sidebar.syncTimeout = null;
            if( app.ui.sidebar.visible || (reloaded === true) ) {
                app.ui.sidebar.syncSync();
            }
        }, 250);
    };
    this.applyListSort = function (id, sortRule) {
        // Update list.js featureList
            var list = new List(id, {
                valueNames: ['sortFeatureName', 'sortStatus', 'sortLocation', 'sortDistance', 'sortUpdated', 'sortSize', 'sortInfo'],
                page: 2000
            });
            list.sort(sortRule.field, { order: sortRule.order });
    }
    this.syncSync = function() {
        // Recompute sidebar features
        var rows = [[],[]];
        app.data.visitVisibleLayers(function(layer){
            if( !layer.feature.classification.unlisted ) {
                if( layer.feature.properties.feedType === 'warning' ) {
                    rows[0].push(app.ui.sidebar.createSidebarLayerRow(layer));
                } else {
                    rows[1].push(app.ui.sidebar.createSidebarLayerRow(layer));
                }
            }
        });
        for(var i=0; i<rows.length; i++) {
            var featureList = '#feature-list-'+i;
            $(featureList+' .no-elements-on-the-list').hide();
            $(featureList+' > thead').show();
            if (rows[i].length===0) {
                $(featureList+' .no-elements-on-the-list').show();
                $(featureList+' > thead').hide();
            }
            $(featureList+' > tbody.list').html(rows[i]);
            $('#feature-list-tab-link-'+i+' span.badge').html(rows[i].length);
        }

        if( !rows[0].length && rows[1].length ) {
            this.showTab('incident');
        } else if( !rows[1].length && rows[0].length ) {
            this.showTab('warning');
        }

        //Show sort bar

        if (rows[0].length || rows[1].length) {
            $('.sidebar-table').removeClass('no-feature-row');
        }
        else {
            $('.sidebar-table').addClass('no-feature-row');
        }
        // Update badges in filter dropdowns
        app.ui.filter.updateFilters();

        // fetch the latest sort order for items in the list
        //TRUONG : made change after UAT , separate rule sort for warning (by type) and incident (by update) by default, not store soft rule into cookies
        //var sortRule = this.loadSortCookie();
        // Update list.js featureList
        this.applyListSort('feature-list-0', this.sortRule.warning)
        this.applyListSort('feature-list-1', this.sortRule.incident)

        this.updateSummary();

        // restore feature selection
        app.ui.selection.reselect();
    };

    this.getNumberDescription = function(num, textZero, textOne, textMore) {
        var ret;
        if (num===0) {
            ret = textZero;
        } else if (num===1) {
            ret = textOne;
        } else {
            ret = textMore;
        }
        return ret;
    };

    this.updateSummary = function() {
        var html;
        var zoomToStateHtml = '<br/> <a href="javascript:void(0)" class="zoom-to-state">Zoom to State</a>';
        var totalWarnings = app.data.getTotalWarnings();
        var warningOutside = totalWarnings - $("#feature-list-0").find(".feature-row").length;
        html = this.getNumberDescription(
            warningOutside,
            'There are no warnings outside of your current map view.',
            'There is <a href="javascript:void(0)" class="zoom-to-state" title="click here to view all warnings">1 warning </a> outside of your current map view and/or filters.' + zoomToStateHtml,
            'There are <a href="javascript:void(0)" class="zoom-to-state" title="click here to view all warnings">' + warningOutside + ' warnings </a> outside of your current map view and/or filters.' + zoomToStateHtml
        );
        $('#sidebar #feature-list-tab-0 tfoot.list-summary td').html(html);
        var otherIncidents = app.data.getTotalIncidents();
        var otherOutside = otherIncidents - $("#feature-list-1").find(".feature-row").length;
        html = this.getNumberDescription(
            otherOutside,
            'There are no incidents outside of your current map view.',
            'There is <a href="javascript:void(0)" class="zoom-to-state" title="click here to view">1 incident </a> outside of your current map view and/or filters.' + zoomToStateHtml,
            'There are <a href="javascript:void(0)" class="zoom-to-state" title="click here to view all incidents">' + otherOutside + ' incidents </a> outside of your current map view and/or filters.' + zoomToStateHtml
        );
        $('#sidebar #feature-list-tab-1 tfoot.list-summary td').html(html);
        $('.zoom-to-state').click(function (e) {
            e.preventDefault();
            util.cookies.clearAll();
            $(".select-default").trigger('click')
            app.map.showAll();
        });
    };

    this.showAllTabs = function() {
        $('#features .tab-content .tab-pane').addClass('active');
    };

    this.showSingleTab = function() {
        $('#features .tab-content .tab-pane').removeClass('active');
        var active = $('.sidebar-table .tab-navigation li.active a');
        $('.sidebar-table .tab-navigation li').removeClass('active');
        active.tab('show');
    };

    this.visible = false;
    this.setVisible = function(visible) {
        if( visible && !this.visible ) {
            this.sync();
        }
        this.visible = visible;
    };

    this.init = function () {
        this.tabContent = $("#tab-content");

        //sort cookies
        $('.sort').on('click', function (e) {
            e.preventDefault();
            app.ui.sidebar.sortFeatureList(this.id);
            return false;
        });

        var sortLabel = util.cookies.get('empublic-sort-label') || '';
        $('.sort-label').text(' by: '+ sortLabel);

        $('.feature-list-show-all a').click(function(e) {
            e.preventDefault();
            app.map.showAll();
        });

        $('#sortDistance_asc').click(function(e) {
            e.preventDefault();
            app.map.showAll();
        });
        $('.tab-content').on('scroll', function () {
            var sidebartable = $('.sidebar-table');
            if ($(this).scrollTop() > 50) {
                sidebartable.addClass('sidebar-table-scrolling');
            } else {
                sidebartable.removeClass('sidebar-table-scrolling');
            }
        });

        $('a[data-toggle="tab"]').on('shown.bs.tab', function () {
            document.getElementById('tab-content').scrollTop = 0;
        });
    };

    this.sortFeatureList = function (key) {
        var rule = {
            field: key.substring(0, key.indexOf('_')),
            order: key.substring(key.indexOf('_') + 1)
        };

        if (app.ui.sidebar.getActiveTab() === 'warning') {
            util.cookies.set('empublic-warning-sort', key);
            this.sortRule.warning = rule;
        }
        else {
            util.cookies.set('empublic-incident-sort', key);
            this.sortRule.incident = rule;
        }
        app.ui.sidebar.syncSync();
    };
}).apply(app.ui.sidebar);
