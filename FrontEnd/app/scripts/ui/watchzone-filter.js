'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.watchfilter = app.ui.watchfilter || {};

(function() {

    this.currentWatchZone ={};

    this.createFilterDropdownThematicHeader = function(filter) {
        filter.thematicname = filter.name.split("/")[0];
        var $li = $(app.templates.watchzone.filter.headers(filter));
        //$('input', $li).prop('checked', true);
        $li.find('input:first').on('change', function () {
            var selected = ($(this).prop('checked'));
            var ul = $(this).closest('li').next();
            ul.find('input').prop('checked', selected);
            $('.subcategory-thematic-' + filter.thematicname).removeClass('hidden');
        });
        $li.find('span').on('click', function(ev){
            if( $li.hasClass('watchzone-folder-open') ) {
                $li.removeClass('watchzone-folder-open');
                $li.addClass('watchzone-folder-closed');
                $('.subcategory-thematic-'+filter.thematicname).addClass('hidden');
            } else {
                $li.removeClass('watchzone-folder-closed');
                $li.addClass('watchzone-folder-open');
                $('.subcategory-thematic-'+filter.thematicname).removeClass('hidden');
            }
            ev.preventDefault();
        });
        return $li;
    };

    this.createFilterDropdownThematicItem = function(filter) {
        filter.thematicname = filter.name.split("/")[0];
        var $li = $(app.templates.watchzone.filter.items(filter));
        return $li;
    };

    this.getFilters = function() {
        var filters = [];
        var a = $('.check-wzfilters:checked');

        $('.check-wzfilters:checked').each(function() {
            var chk = $(this);
            var p = chk.closest('.subfilter-lists').prev().find('input:first');
            filters.push( {
                feedType: p.attr('feedType'),
                category1: p.attr('category1'),
                category2: chk.attr('category2')

            });
        });
        return filters;
    };

    this.loadFilters = function( filters) {
        app.ui.watchfilter.drawFiltersTemplate();
        if(!filters) {
            return;
        }
        //app.ui.watchZone.changeWatchzoneFilter(id);
        //add the code to re-populate the list
        filters.forEach (function (item) {
            var li = $('input[category1="' + item.category1 +'"]').parent();
            var ul = li.next();
            var input = ul.find('input[category2="' + item.category2 +'"]');
            input.prop('checked', true);
            li.find('input:first').prop('checked', true);
            if (li.hasClass('watchzone-folder-closed')) {
                li.find('span').trigger('click');
            }
        });
    };

    this.updateWatchfilterSidebar = function(watchZones, isWatchPage) {
        var list = $("#watchzone-filterlist, #xs-watchzone-filterlist");
        if (watchZones && watchZones.length > 0) {
            for (var i = 0; i < watchZones.length; i++) {
                var template = app.templates.watchzone.filter.sidebaritems(watchZones[i]);
                list.append(template);
                var link = list.find('li:last a');
                if (isWatchPage) {
                    link.attr('href', '#').on('click', function(e) {
                        e.preventDefault();
                        $('#watchzone-filterlist li.active').removeClass('active');
                        $(this).closest('li').addClass('active');
                        var id = $(this).attr('item-name');
                        $('.selected-watchzone').text(id);
                        app.ui.watchfilter.currentWatchZone = app.user.profileManager.findWatchZone(id);
                        if (app.ui.watchfilter.currentWatchZone !== null) {
                            app.ui.watchfilter.loadFilters(app.ui.watchfilter.currentWatchZone.filters);
                        }
                    });
                } else {
                    link.attr('href', './profile/filter-watchzone.html?id='+watchZones[i].name);
                }
            }
        }
        else {
            list.append('<p>You have no saved watchzones</p>');
        }

        if (isWatchPage) {
            $('a#watchZoneSideButton').attr('href', '#').on('click', function(e) {
                e.preventDefault();
                list.find('li:first a').trigger('click');
            });
        } else {
            $('a#watchZoneSideButton').attr('href', './profile/filter-watchzone.html?id='+list.find('li:first a').attr('item-name'));
        }
    };

    this.drawFiltersTemplate = function() {
        var ul = $('.incidents-watchzoneFilterList');
        ul.html('');

        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(f) {
            ul.append(app.ui.watchfilter.createFilterDropdownThematicHeader(f));
            if( f.fixed ) { // always on
                f.visible = true;
            } else {
                ul.append(app.ui.watchfilter.createFilterDropdownThematicItem(f));
            }
        });
        //app.ui.watchfilter.loadFilters();
    };

    this.isWatchPage = function() {
        //check if active page is filter watchzones
        if (window.location.href.indexOf('filter-watchzone') > -1) {
            return true;
        } else {
            return false;
        }
    };

    this.init = function() {
        app.ui.watchfilter.updateWatchfilterSidebar(app.user.profileManager.userProfile.watchZones, app.ui.watchfilter.isWatchPage());
        if (this.isWatchPage()) {
            var id = util.feature.getParameterByName('id');
            $('.selected-watchzone').text(id);
            this.currentWatchZone = app.user.profileManager.findWatchZone(id);
            if (this.currentWatchZone !== null) {
                app.ui.watchfilter.loadFilters(this.currentWatchZone.filters);
            }
            $('#save-watchzone-filter').on('click', function() {
                var watchzone = app.ui.watchfilter.currentWatchZone;
                if (watchzone) {
                    watchzone.filters = app.ui.watchfilter.getFilters();
                    app.ui.loading.show(true); //lock ui
                    app.user.profileManager.addOrUpdateWatchzone(watchzone,
                    function (watchzone, wzList) {
                        app.ui.messageBox.info({
                            message: 'Your watch zone filters has been updated.',
                            showClose : true
                        })
                        //close all edit/new/view instance.
                        //app.ui.watchZone.finish();
                    },
                    function () {
                        //show message???]
                    });
                } else {
                    app.ui.messageBox.info({
                        message: 'You do not have any watchzones',
                        showClose : true
                    })
                }
            });
            $('#cancel-watchzone-filter').on('click', function(e) {
                e.preventDefault();
                app.ui.watchfilter.loadFilters(app.ui.watchfilter.currentWatchZone.filters);
            });
            $('.watchzone-content-main a').on('click', function(e) {
                e.preventDefault();
                var $a = $(this).next();
                if (app.ui.layout.isMobileClient()) {
                    $a.parent().toggleClass('hideMobileFilter');
                    $a.toggle();
                }
            });
        }
    };

}).apply(app.ui.watchfilter);
