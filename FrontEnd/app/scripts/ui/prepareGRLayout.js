'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.prepareGRLayout = app.ui.prepareGRLayout || {};
(function () {
    this.lastFilter = null;
    this.menuItems = [
        {
            iconClass: 'icon-controls-warning_pgr_24x24',
            expandIconClass: 'icon-controls-warning_pgr_white_24x24',
            name: 'Understanding Warnings',
            contentUrl: 'being-prepared/understanding-warnings',
            description: '',
            checkedable: false
        },
        {
            iconClass: 'icon-controls-thumbup_24x24',
            name: 'Where do I get information?',
            checkedable: false,
            expandIconClass: 'icon-controls-thumbup_white_24x24',
            contentUrl: 'being-prepared/who-can-help-me'
        },
        {
            name: 'Fire',
            hasChild: true,
            checkedable: false,
            iconClass: 'icon-controls-fire_24x24',
            expandIconClass: 'icon-controls-fire_white_24x24',
            children: [
            {
                name: 'Preparing for fires',
                checkedable: true,
                contentUrl: 'fire/preparing-for-fires/preparing-for-fires'
            },
            {
                name: 'Am I at risk of fire?',
                checkedable: false,
                children: [
                    {
                        name: 'Bushfire history - 50 years',
                        filterName: 'Bushfire history - 50 years',
                        checkedable: true
                    },
                    {
                        name: 'Fire Danger Ratings',
                        filterName: 'Fire Danger Rating Today',
                        checkedable: true
                    },
                    {
                        name: 'CFA & MFB district boundaries',
                        filterName: 'CFA & MFB district boundaries',
                        checkedable: true
                    },
                    {
                        name: 'Neighbourhood safer places',
                        filterName: 'Neighbourhood safer places',
                        checkedable: true
                    }
                ]
            },
            {
                name: 'Planned burns & works',
                checkedable: true,
                contentUrl: 'fire/planned-burns-works/planned-burns-works'
            },
            {
                name: 'Planned burns maps',
                children: [{
                    name: 'Planned burns - last 10 years',
                    filterName: 'Planned burns - last 10 years',
                    checkedable: true
                }
                ]
            }
            ]
        },
{
    name: 'Flood',
    //contentUrl: 'flood',
    iconClass: 'icon-controls-flood_24x24',
    expandIconClass: 'icon-controls-flood_white_24x24',
    children: [
        {
            name: 'Preparing for floods',
            checkedable: true,
            contentUrl: 'flood/preparing-for-floods/preparing-for-floods'
        },
    {
        name: 'Flood History',
        children: [
            //{
            //    name: 'Flood history - 10 years',
            //    checkedable: true,
            //    filterName: 'Flood history - 10 years'
            //},
            //{
            //    name: 'Flood history - 20 years',
            //    checkedable: true,
            //    filterName: 'Flood history - 20 years'
            //},
            //{
            //    name: 'Flood history - 50 years',
            //    checkedable: true,
            //    filterName: 'Flood history - 50 years'
            //},
            {
                name: 'Flood likelihood - 100 years',
                checkedable: true,
                filterName: 'Flood likelihood - 100 years'
            }
        ]
    }
    ]
},
{
    name: 'Storm',
    iconClass: 'icon-controls-storm_24x24',
    expandIconClass: 'icon-controls-storm_white_24x24',
    contentUrl: 'storm/preparing-for-storms'
},
{
    name: 'Earthquake',
    iconClass: 'icon-controls-Earthquake_24x24',
    expandIconClass: 'icon-controls-Earthquake_white_24x24',
    contentUrl: 'earthquake/preparing-for-an-earthquake'
},
{
    name: 'Tsunami',
    iconClass: 'icon-controls-Tsunami_24x24',
    expandIconClass: 'icon-controls-Tsunami_white_24x24',
    contentUrl: 'tsunami/preparing-for-a-tsunami'

},
{
    name: 'Extreme Heat',
    iconClass: 'icon-controls-ExtremeHeat_24x24',
    expandIconClass: 'icon-controls-ExtremeHeat_white_24x24',
    contentUrl: 'extreme-heat/preparing-for-extreme-heat'
}
    ]

    this.sidebar = $('#prepareGDSideBar');
    this.fdrControl = null;
    this.currentStaticData = '';

    //it will be better if change code to reccurensive to support multiple level.
    this.buildSidebarRow = function (row, extendProps) {
        $.extend(row, extendProps);
        row.safeName = row.name.replace(/[^a-zA-Z0-9\-]/g, '');
        row.htmlId = row.uniqueId + '-' + row.safeName;

        var el = app.templates.sidebar.menuItem(row)
    }
    this.buildSidebar = function () {
        var currentSidebar = this.sidebar;
        this.menuItems.map(function (item) {
            item.safeName = item.name.replace(/[^a-zA-Z0-9\-]/g, '');
            item.parent = 'prepareGDSideBar';
            item.containerCss = 'top-level';
            if (!item.children) {
                item.containerCss = 'top-level top-level-no-child';
            }
            var uniqueId = 'child-' + item.safeName;
            item.htmlId = uniqueId;

            var rowTemplate = app.templates.sidebar.menuItem(item);
            currentSidebar.append(rowTemplate);

            var lv1Placeholder = $('#' + uniqueId);
            if (item.children) {
                item.children.map(function (lv1) {
                    lv1.safeName = lv1.name.replace(/[^a-zA-Z0-9\-]/g, '');
                    lv1.parent = uniqueId;
                    lv1.containerCss = 'second-level';
                    var uniqueId2 = uniqueId + '-' + lv1.safeName;
                    lv1.htmlId = uniqueId2;
                    rowTemplate = app.templates.sidebar.menuItem(lv1);
                    lv1Placeholder.append(rowTemplate)
                    var lv2Placeholder = $('#' + uniqueId2);
                    if (lv1.children) {
                        lv1.children.map(function (lv2) {
                            lv2.parent = uniqueId2;
                            lv2.containerCss = 'third-level';
                            lv2.safeName = lv2.name.replace(/[^a-zA-Z0-9\-]/g, '');
                            lv2.htmlId = uniqueId2 + lv2.safeName;
                            rowTemplate = app.templates.sidebar.menuItem(lv2);
                            lv2Placeholder.append(rowTemplate)
                            return lv2;
                        })

                    }

                    return lv1;
                })

            }
            return item;
        });

        $('.top-level-no-child').click(function () {
            $('.panel-pgr-item').removeClass('panel-pgr-item-expanded')
            $(this).addClass('panel-pgr-item-expanded');
        })
        $('.panel-collapse').on('shown.bs.collapse', function (e) {
            //remove all level 1 selected
            $('.top-level').removeClass('panel-pgr-item-expanded');
            $(this).parent().addClass('panel-pgr-item-expanded')
            var top = $(this).offset().top;
            //fix bootstrap strange behavior
            //var sidebarScrollTop = $('#prepareGDSideBar').scrollTop();
            //if (sidebarScrollTop > top) {
            //    $('#prepareGDSideBar').scrollTop(top + 30);
            //}
            var wrapper = $(this).parent();
            if ($(this).is(e.target)) {
                if (!app.ui.layout.isMobileClient() && (app.ui.layout.getActiveState() == 'list' || app.ui.layout.getActiveState() == 'both')) {

                    var firstItem = wrapper.find('.panel-body .panel-pgr-item:first');
                    if (firstItem.length > 0 && !firstItem.hasClass('panel-pgr-item-expanded')) {
                        firstItem.find('a:first').click();
                    }
                    if (firstItem.length == 0) {
                        wrapper.find('.panel-body a:first()').click();
                    }
                }
            }
        });
        $('.panel-collapse').on('hide.bs.collapse', function (e) {
            if ($(this).is(e.target)) {
                $(this).parent().removeClass('panel-pgr-item-expanded')
            }
        });

        $('a.item-name').click(function (ev) {
            ev.preventDefault();
            var contentUrl = $(this).attr('data-contentUrl');
            $('.text-lhs-item-active').removeClass('text-lhs-item-active');

            if (contentUrl) {
                app.ui.prepareGRLayout.displayStaticContent(contentUrl, $(this).attr('title'));
            }
            var filterName = $(this).attr('data-filterName');
            if (filterName) {
                app.ui.prepareGRLayout.displayLayer(filterName);
            }
            $(this).closest('.panel-pgr-item').addClass('text-lhs-item-active');
            if ($(this).closest('.top-level-no-child').length > 0) {
                //click on content on 1st level -> close all collapse panel
                $('.panel-collapse').collapse('hide')
            }
        })
    }

    this.displayStaticContent = function (url, title) {
        var fileUrl = '/prepare-and-get-ready/' + url;
        if (this.currentStaticData == url) {
            $('.static-content-wrapper').addClass('static-content-wrapper-expanded');
            app.ui.filter.setThematicLayer(null, true);
            if (!app.ui.layout.isMobileClient() && app.ui.layout.getActiveState() !== 'list') {
                $("#mobile-sidebar-list-btn").click();
            }
            return;
        }
        this.currentStaticData = url;
        $.get(fileUrl, function (data) {
            var content = $(data).find('.field-name-body');
            $('#static-content-placeholder').html(app.templates.pgrstatic({
                content: content.html(),
                title: title
            }))
            util.dom.ensureExternalLinkStyles($('#static-content-placeholder'));

            $('.static-content-wrapper').addClass('static-content-wrapper-expanded');

            setTimeout(function () {
                $('.static-content-wrapper').scrollTop(0);
                util.dom.responsiveElements('.static-content-wrapper', 'iframe, img', '.static-content');
            }, 200);
        });

        //reset scroller
        $('.static-content-wrapper').scrollTop(0)
        app.ui.filter.setThematicLayer(null, true);
        if (!app.ui.layout.isMobileClient() && app.ui.layout.getActiveState() !== 'list') {
            $("#mobile-sidebar-list-btn").click();
        }
    }

    this.displayLayer = function (filterName) {
        if (filterName !== '') {
            app.data.filters.filter(function (f) {
                return f.name == filterName;
            }).map(function (filter) {
                app.ui.filter.setThematicLayer(filter, true);
                app.ui.filter.ensureSelectedState();
                if (!app.ui.layout.isMobileClient() && app.ui.layout.getActiveState() === 'list') {
                    $("#mobile-sidebar-both-btn").click();
                }
                if (app.ui.layout.isMobileClient()) {
                    $("#mobile-sidebar-map-btn").click();
                }
            });
        }
        $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
    }
    this.removeFDRControl = function () {
        if (this.fdrControl != null) {
            app.map.removeControl(this.fdrControl);
        };
        this.fdrControl = null;
    }
    this.removeLayerName = function () {
        if (this.layerLabelControl) {
            this.layerLabelControl.remove();
        }
    }
    this.displayLayerNameControl = function (filter) {
        if (filter == null) {
            this.removeLayerName();
            this.lastFilter = null;
            return;
        };
        if (this.lastFilter && this.lastFilter.displayName && this.lastFilter.displayName == filter.displayName) {
            //dont display the layername again if select today/next days for FRD
            return;
        }
        this.removeLayerName();

        this.lastFilter = filter;
        this.layerLabelControl = $(app.templates.control.layerName(filter));
        this.layerLabelControl.appendTo('.map-floating-message');
        this.layerLabelControl.find('.close').click(function () {
            app.ui.prepareGRLayout.layerLabelControl.remove();
            app.ui.prepareGRLayout.layerLabelControl = null;
        })
    }
    this.displayFDRControl = function (currentFilter) {
        if ((this.fdrControl && this.fdrControl._map)) {
            $('.fdr-map-control li').removeClass('active')
            $('.fdr-map-control a[filterName="' + currentFilter + '"]').parent().addClass('active');
            return;//control is displayed on map
        };
        this.fdrControl = L.control({
            position: app.ui.layout.isMobileClient() ? 'bottomright' : 'topright'
        });

        this.fdrControl.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        this.fdrControl.update = function (props) {
            this._div.innerHTML = app.templates.control.fdr({
                next2Days: moment().add(2, 'days').format('DD MMM'),
                next3Days: moment().add(3, 'days').format('DD MMM')
            });
        }

        this.fdrControl.addTo(app.map);
        $('.fdr-map-control a[filterName="' + currentFilter + '"]').parent().addClass('active');
        $('.fdr-map-control').find('a').click(function (ev) {
            ev.preventDefault();
            $('.fdr-map-control').find('li').removeClass('active');
            $(this).parent().addClass('active');
            var filterName = $(this).attr('filterName');
            app.ui.prepareGRLayout.displayLayer(filterName);
            return false;
        })
    }
    this.onThematicLayerChanged = function (filter) {
        if (filter == null) {
            app.ui.prepareGRLayout.removeFDRControl();
            app.ui.prepareGRLayout.displayLayerNameControl(filter);
            $('.filter-selected').removeClass('filter-selected');
            $('#filter-dropdown-btn').removeClass('active');
            return;
        }
        //change button style
        $('#filter-dropdown-btn').addClass('active');

        $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
        //unselect current static text panel
        $('.text-lhs-item-active').removeClass('text-lhs-item-active').removeClass('panel-pgr-item-expanded');
        this.currentStaticData = null;
        if (app.ui.layout.isMobileClient()) {
            $("#mobile-sidebar-map-btn").click();
        }
        else {
            if (app.ui.layout.getActiveState() === 'list') {
                $("#mobile-sidebar-both-btn").click();
            }
        }
        //display FDR select controll
        if (/Fire Danger Rating/.test(filter.name)) {
            app.ui.prepareGRLayout.displayFDRControl(filter.name);
            var input = $('.filter-thematic input:checked');
            var layer = input.attr('layer');
            if (app.ui.prepareGRLayout.lastFilter && /Fire Danger Rating/.test(app.ui.prepareGRLayout.lastFilter.name)) {
                $('.filter-selected').removeClass('filter-selected').addClass('hide');
            }
            input.closest('li').addClass('filter-selected').removeClass('hide');
        }
        else {
            app.ui.prepareGRLayout.removeFDRControl();
        }
        app.ui.prepareGRLayout.displayLayerNameControl(filter);
    }
    this.init = function () {
        app.ui.layout.setCookiePreffix('PGR');
        app.ui.filter.keepInCookies = false; //ignore cookies preferences for P&GR page
        app.ui.filter.enableSelectButton = false;
        app.ui.filter.onThematicLayerChanged = this.onThematicLayerChanged;
        app.ui.filter.initDropdown();
        //clear force refresh
        app.ui.layout.removeForceRefresh();

        //preselect none ooption
        $('input[layer="None"]').click();
        app.ui.filter.setThematicLayer(null);

        this.buildSidebar();
        app.data.setAutomaticRefreshEnabled(false);
        app.map.removeControl(app.map.refreshControl);
        //remove refresh panel
        $("#refresh-panel").remove();
        $('#expand-container-button').click(function () {
            $('.static-content-wrapper').toggleClass('static-content-wrapper-expanded');
        })
        $('#mobile-sidebar-list-btn').click(function () {
            $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
            $('body').addClass('info-view')
            $('body').removeClass('map-view')
            if (!app.ui.layout.isMobileClient()) {
                if (!app.ui.prepareGRLayout.currentStaticData) {
                    $('#anchor-child-UnderstandingWarnings').click() //show first item
                }
            }
            app.ui.filter.setThematicLayer(null);
            //$('input[layer="None"]').click();
        })
        $('#mobile-sidebar-map-btn').click(function () {
            $('body').removeClass('info-view')
            //$('body').addClass('map-view')
            $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');

            if (!app.ui.layout.isMobileClient()) {
                if ($('#help-message').hasClass('hide')) {
                    $('#help-message').append($('#sidebar-help-message')[0].outerHTML)
                        .removeClass('hide')
                        .find('.close')
                        .click(function () {
                            $('#help-message').remove();
                        });
                }
            }
        });
        $('#mobile-sidebar-both-btn').click(function () {
            $('body').removeClass('info-view')
            //$('body').removeClass('map-view')
            $('body').removeClass('has-help-message')
        })
        //auto switch to list view every page load on mobile view.
        if (app.ui.layout.isMobileClient()) {
            $('#mobile-sidebar-list-btn').click();
        }
        else {
            $('#mobile-sidebar-both-btn').click();
        }
        //reset view to vic bound/ignore cookies value
        setTimeout(function () {
            app.map.fitBounds(fromBBoxString(app.victoriaBounds));
        }, 100);

        $(document).resize(function () {
            util.dom.responsiveElements('.static-content-wrapper', 'iframe, img', '.static-content');
        })
    }
}).apply(app.ui.prepareGRLayout);
