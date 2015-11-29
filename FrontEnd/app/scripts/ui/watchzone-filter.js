'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.watchfilter = app.ui.watchfilter || {};

(function() {

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

    this.initWatchFilters = function() {
        var ul = $('.watchzoneFilterList');
        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(f) {
            ul.append(app.ui.watchfilter.createFilterDropdownThematicHeader(f));
            if( f.fixed ) { // always on
                f.visible = true;
            } else {
                ul.append(app.ui.watchfilter.createFilterDropdownThematicItem(f));
            }
            ul.append('<li class="divider" role="separator"/>');
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
    };

    this.init = function() {
        app.ui.watchfilter.initWatchFilters();
    };

}).apply(app.ui.watchfilter);
