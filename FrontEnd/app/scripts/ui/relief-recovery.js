'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.reliefRecoveryLayout = app.ui.reliefRecoveryLayout || {};
(function () {
    this.sidebar = $('#reliefGDSideBar');
    this.currentStaticData = '';
    this.menuItems = [];

    this.buildSidebar = function (topics) {
        //var currentSidebar = this.sidebar;
        var currentSidebar = $('#reliefGDSideBar')
        topics.map(function (item) {
            item.safeName = item.name.replace(/[^a-zA-Z0-9\-]/g, '');
            item.parent = 'reliefGDSideBar';
            item.containerCss = 'top-level';
            if (!item.children) {
                item.containerCss += ' top-level-no-child';
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

                    return lv1;
                })

            }
            return item;
        });

        $('.top-level, .top-level-no-child').click(function () {
            $('.panel-pgr-item').removeClass('panel-pgr-item-expanded');
            $(this).addClass('panel-pgr-item-expanded');
        })

        $('.panel-collapse-menu-content').on('shown.bs.collapse', function () {
            $(this).parent().addClass('panel-pgr-item-expanded');
            if (!app.ui.layout.isMobileClient()) {
                $(this).find('a.item-name:first').click();
            }
        });

        $('.panel-collapse-menu-content').on('hide.bs.collapse', function (e) {
            if ($(this).is(e.target)) {
                $(this).parent().removeClass('panel-pgr-item-expanded')
            }
        });

        //clicking on child item
        $('a.item-name').click(function (ev) {
            ev.preventDefault();
            if (app.ui.layout.isMobileClient() && $(this).closest('.second-level').length>0) {
                $('#sidebar').hide();
            }
            var contentUrl = $(this).attr('data-contentUrl');
            if (contentUrl) {
                $('.text-lhs-item-active').removeClass('text-lhs-item-active');

                $(this).closest('.panel-pgr-item').addClass('text-lhs-item-active');
                app.ui.reliefRecoveryLayout.displayStaticContent(contentUrl, $(this).attr('title'));
            }
        });
    };

    this.displayStaticContent = function (url, title) {
        var fileUrl = url;
        this.currentStaticData = url;
        $.ajax({
            async: false,
            type: 'GET',
            url: fileUrl,
            success: function(data) {
                var content = $(data).find('.field-name-body');
                $('#static-content-placeholder').html(app.templates.pgrstatic({
                    content: content.html(),
                    title: title
                }))
                util.dom.ensureExternalLinkStyles($('.static-content'));
                $('.static-content-wrapper').addClass('static-content-wrapper-expanded');
                $('.static-content-wrapper-expanded').scrollTop(0);
                $('#expand-container-button').unbind('click').on('click', function() {
                    $('.static-content-wrapper').removeClass('static-content-wrapper-expanded');
                    $('#sidebar').show();
                })
                util.dom.responsiveElements('.static-content-wrapper','iframe, img','.static-content');
            }
        });
    }

    this.createDynamicSidebarObject = function(item, pages) {
        var headers = {
            name: item.rrtax,
            hasChild: true,
            checkedable: true,
            iconClass: 'icon-controls-'+item.iconography+'_24x24',
            expandIconClass: 'icon-controls-'+item.iconography+'_white_24x24',
            children:[
            ]
        }
        //creates children
        for (var i = 0; i < pages.length; i++) {
            var child = [];
            if (pages[i].rrtax === item.rrtax) {
                child.name = pages[i].title;
                child.contentUrl = pages[i].url.replace('http://em-public.ci.devcop.em.vic.gov.au/','/');
                child.sortOrder = pages[i].sortOrder;
                headers.children.push(child)
            }
        }
        //sort children
        headers.children.sort(function(a, b) {
            return parseInt(a.sortOrder) - parseInt(b.sortOrder);
        });
        return headers;
    }

    this.selectFirstItemOnLoad = function() {
        if (!app.ui.layout.isMobileClient()) {
            $('#reliefGDSideBar').find('a:first').click();
            $('#reliefGDSideBar').find('.panel-collapse:first').find('a:first').click();
        }
    }

    this.fetchSidebarContent = function() {
        $.ajax({
            async: false,
            type: 'GET',
            url: '/public/cms-relief-recovery.json',
            success: function(items) {
                if (items.pages) {
                    var page = items.pages;
                    //get unique headers to create sidebar
                    var uniqueHeaders = []
                    for (var i = 0; i < page.length; i++) {
                        if (uniqueHeaders.indexOf(page[i].rrtax) == -1) {
                            uniqueHeaders.push(page[i].rrtax);
                            var unique = app.ui.reliefRecoveryLayout.createDynamicSidebarObject(page[i], page);
                            app.ui.reliefRecoveryLayout.menuItems.push(unique);
                        }
                    }
                    app.ui.reliefRecoveryLayout.buildSidebar(app.ui.reliefRecoveryLayout.menuItems);
                    app.ui.reliefRecoveryLayout.selectFirstItemOnLoad()
                }
            }
        });
    };

    this.init = function () {
        var modal = app.templates.modal({
            modalId: 'staticModal',
            modalClass: 'modalStatic'
        });
        $('body').append(modal);
        this.staticModal = $('#staticModal');
        this.fetchSidebarContent();

        $(document).resize(function() {
            util.dom.responsiveElements('.static-content-wrapper','iframe, img','.static-content');
        })
    };

}).apply(app.ui.reliefRecoveryLayout);
