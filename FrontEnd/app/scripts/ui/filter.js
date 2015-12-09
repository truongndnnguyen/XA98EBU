'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.filter = app.ui.filter || {};

(function() {

    this.createFilterDropdownItem = function(filter) {
        var $li = $(app.templates.dropdown.filter.category(filter));
        $('input',$li).prop('checked',filter.visible);
        if( filter.fixed !== true ) {
            $('input',$li).on('click', function(){
                app.ui.filter.setOneFilter(filter, this.checked);
                app.ui.filter.updateButtonState();
                app.data.batchUpdateDataLayerVisibility();
                app.ui.sidebar.sync();
            });
        }
        return $li;
    };

    this.createFilterDropdownThematicHeader = function() {
        var $li = $('<li role="separator" class="filter-folder filter-folder-open">'+
            '<span class="filter-folder-open-control fa fa-caret-right"></span>'+
            '<span class="filter-folder-close-control fa fa-caret-down"></span>'+
            '&nbsp;&nbsp;Map Overlays</li>');
        $li.on('click', function(ev){
            if( $li.hasClass('filter-folder-open') ) {
                $li.removeClass('filter-folder-open');
                $li.addClass('filter-folder-closed');
                $('.filter-thematic').hide();
            } else {
                $li.removeClass('filter-folder-closed');
                $li.addClass('filter-folder-open');
                $('.filter-thematic').show();
            }
            ev.preventDefault();
        });
        return $li;
    };

    this.createFilterDropdownThematicItem = function(filter, uniq) {
        filter.unique = uniq;
        var $li = $(app.templates.dropdown.filter.thematic(filter));
        $('input',$li).on('click', function(){
            app.ui.filter.setThematicLayer(filter);
            app.ui.filter.updateButtonState();
        });
        return $li;
    };

    this.createFilterDropdownThematicDeselect = function(uniq) {
        var $li = $(app.templates.dropdown.filter.thematic({name: 'None', unique: uniq}));
        $('input',$li).prop('checked',true);
        $('input',$li).on('click', function(){
            app.ui.filter.setThematicLayer(null);
            app.ui.filter.updateButtonState();
        });
        return $li;
    };

    this.computeFilterState = function() {
        var stdAllOff = true;
        var stdAllDef = true;

        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(filter){
            if( filter.fixed ) {
                // ignore
                return;
            }
            stdAllOff = stdAllOff && !filter.visible;
            if( filter.defaultHidden ) {
                // should be off
                stdAllDef = stdAllDef && !filter.visible;
            } else {
                // should be on
                stdAllDef = stdAllDef && filter.visible;
            }
        });

        app.data.filters.filter(function(f) {
            return f.thematicLayer === true;
        }).forEach(function(filter){
            stdAllOff = stdAllOff && !filter.visible;
        });

        return stdAllDef?'all':(stdAllOff?'none':'some');
    };

    this.updateButtonState = function(allSomeOrNone) {
        allSomeOrNone = allSomeOrNone || this.computeFilterState();

        $('.filterUnorderedList .select-default').removeClass('active');
        $('.filterUnorderedList .clear-all').removeClass('active');
        $('#filter-dropdown-btn').addClass('active');
        $('#filter-dropdown-btn').html('Filters: On');

        if( allSomeOrNone === 'all') {
            $('.filterUnorderedList .select-default').addClass('active');
            $('#filter-dropdown-btn').removeClass('active');
            $('#filter-dropdown-btn').html('Filter');
        } else if( allSomeOrNone === 'some' ) {
        } else if( allSomeOrNone === 'none' ) {
            $('.filterUnorderedList .clear-all').addClass('active');
        }
    };

    this.setThematicLayer = function(filter) {
        var visibility = {};
        app.data.filters.filter(function(f) {
            return f.thematicLayer === true;
        }).forEach(function(f) {
            f.visible = ( filter && filter.name === f.name );
            visibility[f.name] = f.visible;
            util.cookies.set(f.name, f.visible);
            app.data.setDataLayerVisibility(f.name, f.visible);
        });

        $('.filter').filter(function(){
            return this.getAttribute('data-category') === (filter ? filter.name : 'None');
        }).map(function(){
            $('input', this).prop('checked', true);
        });
    };

    this.setOneFilter = function(filter, enable) {
        filter.visible = enable;
        util.cookies.set(filter.name, filter.visible);
        $('.filter').filter(function(){
            return this.getAttribute('data-category') === filter.name;
        }).map(function(){
            $('input',this).prop('checked', enable);
        });
        app.data.setDataLayerVisibility(filter.name, filter.visible);
    };

    this.setAllFilters = function (enable) {
        app.data.filters.forEach(function(filter){
            if( filter.fixed ) {
                filter.visible = true;
            } else {
                app.ui.filter.setOneFilter(filter, enable);
            }
        });
        app.data.batchUpdateDataLayerVisibility();
        app.ui.sidebar.sync();
    };

    this.setDefaultFilters = function () {
        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(filter){
            var enable = true;
            if( filter.defaultHidden ) {
                enable = false;
            }
            app.ui.filter.setOneFilter(filter, enable);
        });
        app.data.batchUpdateDataLayerVisibility();
        app.ui.sidebar.sync();
    };

    this.updateFilterDropdownItemBadge = function($filter, count, visible) {
        $('input',$filter).prop('checked', visible);

        var $badge = $('.badge',$filter);
        var $label = $('label',$filter);

        if( count ) {
            $label.attr('class', $label.hasClass('fixed') ? 'fixed' : 'emphasis');
            $badge.removeClass('sr-only');
        } else {
            $label.attr('class', $label.hasClass('fixed') ? 'fixed' : 'no-emphasis');
            $badge.addClass('sr-only');
        }
        $badge.find('> .count').html(count);
    };

    this.updateFilters = function() {
        var model = app.data.buildCategoryModel();
        $('.filter').map(function() {
            var cat = this.getAttribute('data-category');
            model[cat] = model[cat] || {count:0, visible:true};
            app.ui.filter.updateFilterDropdownItemBadge(this, model[cat].count, model[cat].visible);
        });
    };

    this.updateFilterVisibility = function() {
        app.ui.filter.updateButtonState();

        var visibleItem = null;
        app.data.filters.filter(function(f) {
            return f.thematicLayer === true;
        }).forEach(function(f) {
            visibleItem = ( f.visible ) ? f : visibleItem;
        });

        app.ui.filter.setThematicLayer(visibleItem);
    };

    this.initDropdown = function() {
        var ul = $('.filterUnorderedList');
        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(f) {
            if( f.fixed ) { // always on
                f.visible = true;
            }
            ul.append(app.ui.filter.createFilterDropdownItem(f));
        });

        ul.append('<li class="divider" role="separator"/>');
        ul.append(this.createFilterDropdownThematicHeader());
        ul.each(function() {
            var uniq = '';
            var current = $(this);
            if (current.hasClass('normal-filter-group')) {
                uniq = 1;
            } else if (current.hasClass('modal-filter-group')) {
                uniq = 2;
            }
            current.append(app.ui.filter.createFilterDropdownThematicDeselect(uniq));
            app.data.filters.filter(function(f) {
                return f.thematicLayer === true;
            }).forEach(function(f) {
                if( f.fixed ) { // always on
                    f.visible = true;
                }
                current.append(app.ui.filter.createFilterDropdownThematicItem(f, uniq));
            });
        });

        $(document).on('click', '#filter-panel', function (e) {
            e.stopPropagation();
        });
    };

    this.openFilterModal = function() {
        $('#filterModal').modal('show');
    };

    this.init = function() {
        if (document.body.clientWidth < 768) {
            $('#filter-dropdown-btn').removeAttr('data-toggle');
        }

        this.initDropdown();

        $('.filterUnorderedList .select-default').on('click', function(ev) {
            app.ui.filter.updateButtonState('all');
            app.ui.filter.setDefaultFilters();
            ev.preventDefault();
        });

        $('.filterUnorderedList .clear-all').on('click', function(ev) {
            app.ui.filter.updateButtonState('none');
            app.ui.filter.setAllFilters(false);
            ev.preventDefault();
        });

        $('#filter-dropdown-btn').on('click', function(ev) {
            if( document.body.clientWidth <= 767 ) {
                app.ui.filter.openFilterModal();
                ev.preventDefault();
            }
        });
    };

}).apply(app.ui.filter);
