'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.prepareGRLayout = app.ui.prepareGRLayout || {};
(function () {
    this.sidebar = $('#prepareGDSideBar');
    this.fdrControl = null;
    this.currentStaticData = '';

    //it will be better if change code to reccurensive to support multiple level.
    this.buildSidebarRow = function (row, extendProps) {
        $.extend(row, extendProps);
        row.safeName = row.name.replace(/[^a-zA-Z0-9\-]/g, '');
        row.htmlId = row.uniqueId + '-' + row.safeName;

        var el = app.templates.sidebar.prepareGR.level1(row)
    }
    this.buildSidebar = function (rules) {
        var currentSidebar = this.sidebar;
        rules.map(function (item) {
            item.safeName = item.name.replace(/[^a-zA-Z0-9\-]/g, '');
            item.parent = 'prepareGDSideBar';
            item.containerCss = 'top-level';
            if (!item.childrens) {
                item.containerCss = 'top-level top-level-no-child';
            }
            var uniqueId = 'child-' + item.safeName;
            item.htmlId = uniqueId;

            var rowTemplate = app.templates.sidebar.prepareGR.level1(item);
            currentSidebar.append(rowTemplate);

            var lv1Placeholder = $('#' + uniqueId);
            if (item.childrens) {
                item.childrens.map(function (lv1) {
                    lv1.safeName = lv1.name.replace(/[^a-zA-Z0-9\-]/g, '');
                    lv1.parent = uniqueId;
                    lv1.containerCss = 'second-level';
                    var uniqueId2 = uniqueId + '-' + lv1.safeName;
                    lv1.htmlId = uniqueId2;
                    rowTemplate = app.templates.sidebar.prepareGR.level1(lv1);
                    lv1Placeholder.append(rowTemplate)
                    var lv2Placeholder = $('#' + uniqueId2);
                    if (lv1.childrens) {
                        lv1.childrens.map(function (lv2) {
                            lv2.parent = uniqueId2;
                            lv2.containerCss = 'third-level';
                            lv2.safeName = lv2.name.replace(/[^a-zA-Z0-9\-]/g, '');
                            lv2.htmlId = uniqueId2 + lv2.safeName;
                            rowTemplate = app.templates.sidebar.prepareGR.level1(lv2);
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
            $(this).parent().addClass('panel-pgr-item-expanded')
            var top = $(this).offset().top;
            //fix bootstrap strange behavior
            var sidebarScrollTop = $('#prepareGDSideBar').scrollTop();
            if (sidebarScrollTop > top) {
                $('#prepareGDSideBar').scrollTop(top+30);
            }
            var wrapper = $(this).parent();
            if ($(this).is(e.target)) {
                if (!app.ui.layout.isMobileClient()) {
                    var firstItem = wrapper.find('.panel-body>div:first');
                    firstItem.find('input:first,  a:first').click();
                }
            }
        });
        $('.panel-collapse').on('hide.bs.collapse', function (e) {
            if ($(this).is(e.target)) {
                $(this).parent().removeClass('panel-pgr-item-expanded')
            }
        });

        $('.filterable-checkbox').on('change', this.onCheckedLHSItem);

        $('a.item-name').click(function () {
            var contentUrl = $(this).attr('data-contentUrl');
            if (contentUrl) {
                $('.text-lhs-item-active').removeClass('text-lhs-item-active');
                $('input[type="checkbox"]:checked').click() //unchekc current layer selected.

                $(this).closest('.panel-pgr-item').addClass('text-lhs-item-active');
                app.ui.prepareGRLayout.displayStaticContent(contentUrl, $(this).attr('title'));
                //unselect other checkbox

            }
        })
    }
    //No longer need code, it can be resolve easy by change  checkbox to ratio button since requirement has been changed - do it later.
    this.clearOtherCheckbox = function (current) {
        var visible = $(this).prop('checked');
        var filterName = current.attr('data-filter');
        var contentUrl = current.attr('data-contentUrl');
        var visible = current.prop('checked');
        var checkedList = $('.filterable-checkbox:checked');
        for (var i = 0; i <= checkedList.length; i++) {
            var item = $(checkedList[i]);
            if (item.attr('id') === current.attr('id')) continue;
            //if ((filterName && item.attr('data-filter')) || (
            //    contentUrl && item.attr('data-contentUrl'))) {
                item.prop('checked', false);
            // }
        }
    }
    this.onCheckedLHSItem = function (ev) {
        $('.text-lhs-item-active').removeClass('text-lhs-item-active');
        $('.layer-lhs-item-active').removeClass('layer-lhs-item-active');

        var visible = $(this).prop('checked');
        app.ui.prepareGRLayout.clearOtherCheckbox($(this));

        var filterName = $(this).attr('data-filter');
        var contentUrl = $(this).attr('data-contentUrl');
        if (!visible) {
            app.ui.filter.setThematicLayer(null, true);
            app.ui.prepareGRLayout.removeFDRControl();
            if (contentUrl === app.ui.prepareGRLayout.currentStaticData) {
                $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
            }
            return;
        }
        else {
            //if mobile/swith to map view if on mobile and view map content
            if (app.ui.layout.isMobileClient() && filterName) {
                $('#mobile-sidebar-map-btn').trigger('click');
            }
            if (filterName) {
                //remove later
                if (filterName === 'ignore') {
                    app.ui.filter.setThematicLayer(null, true);
                    app.ui.prepareGRLayout.removeFDRControl();
                } else {
                    app.ui.prepareGRLayout.displayLayer(filterName);
                }
                $(this).closest('.panel-pgr-item').addClass('layer-lhs-item-active');
            } else
                if (contentUrl) {
                    $(this).closest('.panel-pgr-item').addClass('text-lhs-item-active');
                    app.ui.prepareGRLayout.displayStaticContent(contentUrl, $(this).attr('title'));
                }
                else {
                    app.ui.filter.setThematicLayer(null, true);
                    app.ui.prepareGRLayout.removeFDRControl();
                    if (contentUrl === app.ui.prepareGRLayout.currentStaticData) {
                        $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
                    }
                }
        }
    }
    this.displayStaticContent = function (url, title) {
        var fileUrl = '/prepare-and-get-ready/' + url;
        if (this.currentStaticData == url) {
            $('.static-content-wrapper').addClass('static-content-wrapper-expanded');
            return;
        }
        this.currentStaticData = url;
        $.get(fileUrl, function (data) {
            var content = $(data).find('.field-name-body');
            $('#static-content-placeholder').html(app.templates.pgrstatic({
                content: content.html(),
                title: title
            }))

            $('.static-content-wrapper').addClass('static-content-wrapper-expanded');
        });

        //reset scroller
        $('#static-content-placeholder').scrollTop(0)
    }
    this.displayLayer = function (filterName) {
        if (filterName !== '') {
            app.data.filters.filter(function (f) {
                return f.name == filterName;
            }).map(function (filter) {
                app.ui.filter.setThematicLayer(filter, true);
                if (filterName.match(/Fire Danger Rating/g)) {
                    app.ui.prepareGRLayout.displayFDRControl();
                }
                else {
                    app.ui.prepareGRLayout.removeFDRControl();
                }
            });
        }
        $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
        app.map.showAll();
    }
    this.removeFDRControl = function () {
        if (this.fdrControl != null) {
            app.map.removeControl(this.fdrControl);
        };
        this.fdrControl = null;
    }
    this.displayFDRControl = function () {

        if ((this.fdrControl && this.fdrControl._map)) {
            return;//control is displayed on map
        };

        this.fdrControl = L.control();

        this.fdrControl.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        this.fdrControl.update = function (props) {
            this._div.innerHTML = '<ul class="fdr-map-control breadcrumb"><li class="active"><a data-filter="Fire Danger Rating Today" >TODAY</a></li><li><a data-filter="Fire Danger Rating Tomorrow">TOMORROW</a></li><li><a data-filter="Fire Danger Rating next 2 days">' + moment().add(2, 'days').format('DD MMM').toUpperCase() + '</a></li><li><a data-filter="Fire Danger Rating next 3 days">' + moment().add(3, 'days').format('DD MMM').toUpperCase() + '</a></li></ul>'
        };

        this.fdrControl.addTo(app.map);
        $('.fdr-map-control').find('a').click(function (ev) {
            ev.preventDefault();
            $('.fdr-map-control').find('li').removeClass('active');
            $(this).parent().addClass('active');
            var filterName = $(this).attr('data-filter');
            app.ui.prepareGRLayout.displayLayer(filterName);
            return false;
        })
    }
    this.init = function () {
        this.buildSidebar(app.rules.prepareGR.filters);
        app.data.setAutomaticRefreshEnabled(false);
        $('#expand-container-button').click(function () {
            $('.static-content-wrapper').toggleClass('static-content-wrapper-expanded');
        })
        //auto switch to list view every page load on mobile view.
        if (app.ui.layout.isMobileClient()) {
            $('#mobile-sidebar-list-btn').click();
        }

    }
}).apply(app.ui.prepareGRLayout);
