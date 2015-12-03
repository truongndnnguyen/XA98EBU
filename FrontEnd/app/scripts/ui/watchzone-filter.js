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
        $('input', $li).prop('checked', filter.visible);
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
        filter.unique = (new Date()).getTime();
        var $li = $(app.templates.watchzone.filter.items(filter));
        return $li;
    };

    this.getFilters = function() {
        return [{ name: 'hello world'}];
    }
    this.hide = function  () {
        //$('#watchzoneFilterModal').modal('hide');
    }
    this.showFilter = function( filters, updateCallback, cancelCallback) {
        app.ui.watchZone.changeWatchzoneFilter(id);
        app.ui.watchfilter.initWatchFilters(filters);
        //$('#watchzoneFilterModal').modal('show');
        $('#update-watchfilter').on('click', function(e) {
            alert('Hi');
            var filters = app.ui.watchfilter.getFilters();
            if(updateCallback) {
                updateCallback(filters);
            }
        });
    };

    this.updateWatchfilterSidebar = function(watchZones) {
        console.log('update');
        console.log(watchZones);
        var list = $("#watchzone-filterlist");
        if (watchZones && watchZones.length > 0) {
            list.find('.watchzone-item').remove();
            $(".watchzone-count").html(watchZones.length).removeClass('hide');

            for (var i = 0; i < watchZones.length; i++) {
                var template = app.templates.watchzone.filter.sidebaritems(watchZones[i]);
                list.append(template);
            }
        }
        else {
            list.append('<p>You have no saved watchzones</p>');
        }
    }

    /*this.changeWatchzoneshowFilterFilter = function(id) {
        //$('#watchzoneFilterModal').modal('show');
        //var watchzone = app.user.profile.findWatchZone(id);
        app.ui.watchfilter.(watchzone.filters,
            function (filters) {
                if (watchzone) {
                    watchzone.filters  = filters;
                    app.ui.loading.show(true); //lock ui
                    app.user.profile.addOrUpdateWatchzone(watchzone,
                    function (watchzone, wzList) {
                        app.ui.messageBox.info({
                            message: 'Your watch zone filters has been updated.',
                            showClose : true
                        })
                        app.ui.watchfilter.hide();
                        //close all edit/new/view instance.
                        //app.ui.watchZone.finish();
                    },
                    function () {
                        //show message???

                    });
                }

            });
    };*/

    this.initWatchFilters = function(id) {
        var ul = $('.incidents-watchzoneFilterList');
        ul.html('');
        this.currentWatchZone = app.user.profile.findWatchZone(id);
        console.log(this.currentWatchZone);

        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(f) {
            ul.append(app.ui.watchfilter.createFilterDropdownThematicHeader(f));
            if( f.fixed ) { // always on
                f.visible = true;
            } else {
                ul.append(app.ui.watchfilter.createFilterDropdownThematicItem(f));
            }
            //ul.append('<li class="divider" role="separator"/>');
        });

        ul.each(function() {
            app.data.filters.filter(function(f) {
                return f.thematicLayer === false;
            }).forEach(function(f) {
                if( f.fixed ) { // always on
                    f.visible = true;
                }
            });
        });
        app.ui.watchfilter.updateWatchfilterSidebar(app.user.profile.userProfile.watchZones);

        $('#save-watchzone-filter').on('click', function() {
            var watchzone = app.ui.watchfilter.currentWatchZone;
            console.log(watchzone);
            if (watchzone) {
                watchzone.filters = filters;
                app.ui.loading.show(true); //lock ui
                app.user.profile.addOrUpdateWatchzone(watchzone,
                function (watchzone, wzList) {
                    app.ui.messageBox.info({
                        message: 'Your watch zone filters has been updated.',
                        showClose : true
                    })
                    app.ui.watchfilter.hide();
                    //close all edit/new/view instance.
                    //app.ui.watchZone.finish();
                },
                function () {
                    //show message???

                });
            }
        });
    };

    this.init = function() {
        var id = util.feature.getParameterByName('id');
        app.ui.watchfilter.initWatchFilters(id);
    };

}).apply(app.ui.watchfilter);
