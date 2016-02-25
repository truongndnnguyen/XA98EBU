'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.filter = app.ui.filter || {};

(function() {
    this.keepInCookies = true;
    this.enableSelectButton = true;

    this.toggleFilter = function (filter, item) {
        var checked = item.checked;
        $('[parent-name="' + filter.name + '"]').each(function (item) {
            $(this).prop('checked', checked);
            var fname = $(this).attr('filter-name');
            app.data.filters.filter(function (f) {
                return f.name == fname;
            }).map(function (f) {
                app.ui.filter.setOneFilter(f, checked);
            });
        })

        app.data.filters.filter(function (f) {
            return f.name == $(item).attr('parent-name');
        }).map(function (f) {
            app.ui.filter.setOneFilter(f, false);
            $('[filter-name="' + $(item).attr('parent-name') + '"]').prop('checked', false);
        });

    }
    this.createFilterDropdownItem = function(filter) {
        var $li = $(app.templates.dropdown.filter.category(filter));

        $('input',$li).prop('checked',filter.visible);
        if( filter.fixed !== true ) {
            $('input', $li).on('change', function () {
                app.ui.filter.toggleFilter(filter, this);
                app.ui.filter.setOneFilter(filter, this.checked);
                app.ui.filter.updateButtonState();
                app.data.batchUpdateDataLayerVisibility();
                app.ui.sidebar.sync();
            });
        }
        return $li;
    };

    this.createFilterDropdownThematicHeader = function (headerName, groupUqid) {
        headerName = headerName || 'Map Overlays';
        var $li = $('<li role="separator" class="filter-folder filter-folder-open">'+
            '<span class="filter-folder-open-control fa fa-caret-right"></span>'+
            '<span class="filter-folder-close-control fa fa-caret-down"></span>'+
            '&nbsp;&nbsp;' + headerName + '</li>');

        $li.on('click', function (ev) {
            if( $li.hasClass('filter-folder-open') ) {
                $li.removeClass('filter-folder-open');
                $li.addClass('filter-folder-closed');
                $('.filter-' + groupUqid).hide();
            } else {
                $li.removeClass('filter-folder-closed');
                $li.addClass('filter-folder-open');
                $('.filter-' + groupUqid).show();
            }
            //app.ui.filter.fixFilterHeight();
            ev.preventDefault();
        });
        return $li;
    };
    this.ensureSelectedState = function () {
        $(".filter-selected").removeClass('filter-selected');
        $('.filter-thematic input:checked').closest('li').addClass('filter-selected');
    };
    this.userChangedLayers = {};
    this.createFilterDropdownThematicItem = function (filter, uniq, groupUqid) {
        filter.unique = uniq;
        filter.groupId = groupUqid;
        var $li = $(app.templates.dropdown.filter.thematic(filter));
        $('input', $li).on('change', function () {
            if (filter.geojsonLayer) {
                app.ui.filter.setOneFilter(filter, $(this).prop('checked'));
                app.data.batchUpdateDataLayerVisibility();
                app.ui.sidebar.sync();
            }
            else {
                $(".filter-selected").removeClass('filter-selected');
                $li.addClass('filter-selected');
                app.ui.filter.setThematicLayer(filter);
            }
            //app.ui.filter.updateButtonState();
        });
        $('input', $li).on('click', function () {
            //keep track the filter that user already select to ignore set default when auto refresh happend. ugly hack
            app.ui.filter.userChangedLayers[filter.name] = true;
        });
        return $li;
    };

    this.createFilterDropdownThematicDeselect = function(uniq) {
        var $li = $(app.templates.dropdown.filter.thematic({name: 'None', unique: uniq}));
        $('input',$li).prop('checked',true);
        $('input', $li).on('click', function () {
            $('.filter-selected').removeClass('filter-selected')
            app.ui.filter.setThematicLayer(null);
            app.ui.filter.updateButtonState();
        });
        return $li;
    };

    this.computeFilterState = function() {
        var stdAllOff = true;
        var stdAllDef = true;

        app.data.filters.filter(function (f) {
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
    //if the filter has is default on -> it always display when user select select all and 1st time page load.
    this.setDefaultLayers = function () {
        app.data.filters.filter(function (f) {
            return f.thematicLayer;
        }).map(function (f) {
            if (f.isDefaultedOn == 'undefined') return;
            $('[layer="' + f.name + '"]').prop('checked', f.isDefaultedOn || false);
            f.visible = f.isDefaultedOn;
            f.defaultHidden = !f.isDefaultedOn;
            f.visibility = f.isDefaultedOn;
            if (!f.defaultHidden) {
                app.ui.filter.setThematicLayer(f);
                app.ui.filter.updateButtonState();
            }
        });
        this.userChangedLayers = {};
    }

    this.updateButtonState = function(allSomeOrNone) {
        allSomeOrNone = allSomeOrNone || this.computeFilterState();

        $('.filterUnorderedList .select-default').removeClass('active');
        $('.filterUnorderedList .clear-all').removeClass('active');
        $('#filter-dropdown-btn').addClass('active');
        if (!app.ui.layout.isMobileClient()) {
            $('#filter-dropdown-btn').html('Filters: On');
        }

        if( allSomeOrNone === 'all') {
            $('.filterUnorderedList .select-default').addClass('active');
            $('#filter-dropdown-btn').removeClass('active');
            $('#filter-dropdown-btn').html('Filter');
        } else if( allSomeOrNone === 'some' ) {
        } else if( allSomeOrNone === 'none' ) {
            $('.filterUnorderedList .clear-all').addClass('active');
        }
    };
    this.fixFilterHeight = function () {
        return;//
        try{
            var height = $(document).height() - 30 -$('#filter-dropdown-btn').offset().top - $('#filter-dropdown-btn').height();
            $('#filter-dropdown-list').css('height','auto');
            setTimeout(function () {
                if ($('#filter-dropdown-list').height() > height) {
                    $('#filter-dropdown-list').css('height', height + 'px');
                }
            }, 200);
        } catch (err) {
            //ignore unit test error.
        }
    }
    //noCache will ignore to save cookies
    this.setThematicLayer = function (filter, noCache) {
        noCache == noCache || app.ui.filter.keepInCookies;
        var visibility = {},
            batchUpdateRequired = false;
        app.data.filters.filter(function(f) {
            return f.thematicLayer === true;
        }).forEach(function (f) {
            var wasVisible = f.visible;
            if (f.multiple) {
                    var layer = $('input[layer="' + filter.name + '"]:first');
                if(f.name == filter.name){
                    f.visible = layer.prop('checked')
                    //layer.closest('li').addClass('layer-selected')
                    visibility[f.name] = f.visible;
                }
                else {
                    visibility[f.name] = f.visible;
                }
            }
            else {
                f.visible = (filter && filter.name === f.name);
                visibility[f.name] = f.visible;
            }
            if (!noCache) {
                util.cookies.set(f.name, f.visible);
            }
            app.data.setDataLayerVisibility(f.name, f.visible);
            if( ((wasVisible?true:false) !== (f.visible?true:false)) && f.thematicFeatures ) {
                batchUpdateRequired = true;
            }
        });

        if (filter && !filter.multiple) {
            $('.filter').filter(function () {
                return this.getAttribute('data-category') === (filter ? filter.name : 'None');
            }).map(function () {
                $('input').closest('li').addClass('layer-selected');
                $('input', this).prop('checked', true);
            });
        }
        if( batchUpdateRequired ) {
            app.data.batchUpdateDataLayerVisibility();
            app.ui.sidebar.sync();
        }
        if (app.ui.filter.onThematicLayerChanged) {
            app.ui.filter.onThematicLayerChanged(filter);
        }
        app.ui.filter.fixFilterHeight();
    };

    this.setOneFilter = function (filter, enable) {
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
        app.data.filters.forEach(function (filter) {
            if (filter.fixed) {
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
        var category = $($filter).attr('data-category');
        if (count && category != 'Fire Danger Ratings') {
            $label.attr('class', $label.hasClass('fixed') ? 'fixed'  : $label.hasClass('has-parent') ? 'has-parent' :'emphasis');
            $badge.removeClass('sr-only');
        } else {
            $label.attr('class', $label.hasClass('fixed') ? 'fixed' : $label.hasClass('has-parent') ? 'has-parent' :'no-emphasis');
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
    this.updateCollapsedFilterCookies = function () {
        var list = [];
        $('.filter-parent:not(".filter-parent-has-children-expanded")').each(function (el) {
            var cat = $(this).attr('data-filter-safe-name');
            list.push(cat);
        });
        util.cookies.set('expanded-filters', JSON.stringify(list), 0)
    };

    this.rerender = function (layers) {
        if (!this.loaded) {
            this.loaded = true;
            util.cookies.get('expanded-filters', null, -1);
            //set all filter on/ignore cookies
            app.ui.filter.updateButtonState('all');
            app.ui.filter.setDefaultFilters();
            app.ui.filter.setDefaultLayers()

        };
        var c = util.cookies.get('expanded-filters');

        var collapsedFilters = JSON.parse(c || '[]');
        $('.filterUnorderedList li.filter, li.filter-folder, li.divider, filter-thematic').remove();

        this.initDropdown();

        app.data.filters.filter(function (f) {
            return f.thematicLayer && f.isDefaultedOn
        }).map(function (f) {
            if (!app.ui.filter.userChangedLayers[f.name]) {
                $('[layer="' + f.name + '"]').prop('checked', true);
                app.ui.filter.setThematicLayer(f);
                app.ui.filter.updateButtonState();
            }
        });
        //enable collapseable for 2nd level/ it will expanded by default
        $('.filter-parent').each(function (element) {
            var filterName = $(this).attr('data-filter-safe-name');
            var children = $('.filter-children-' + filterName);
            if (children.length > 0) {
                $(this).addClass('filter-parent-has-children');
                var inArr = $.inArray(filterName, collapsedFilters)
                if (inArr >= 0) {
                    $(this).addClass('filter-parent-has-children-expanded');
                }
                else {
                    children.each(function (c) {
                        $(this).addClass('hide');
                    });
                    $(this).find('.toggle-children-list-trigger').addClass('collapsed');
                }

                $(this).find('.toggle-children-list-trigger').click(function () {
                    $(this).closest('.filter-parent').toggleClass('filter-parent-has-children-expanded');
                    //if collapsed hide all child rend;
                    $(this).parent().find('a').toggleClass('collapsed');
                    if ($(this).hasClass('collapsed')) {
                        $('.filter-children-' + filterName).addClass('hide');
                    }
                    else {
                        $('.filter-children-' + filterName).removeClass('hide');
                    }
                    app.ui.filter.updateCollapsedFilterCookies();
                });
            }
        });

        if (!app.ui.layout.isMobileClient()) {
            var newHeight = $(window).height() - 270;
            $('#filter-dropdown-list').css('height',newHeight);
        }

        $('[data-category="None"]').remove();

    }
    this.initDropdown = function () {
        var ul = $('.filterUnorderedList');
        app.data.filters.filter(function(f) {
            return f.thematicLayer !== true;
        }).forEach(function(f) {
            if( f.fixed ) { // always on
                f.visible = true;
            }
            ul.append(app.ui.filter.createFilterDropdownItem(f));
        });
        var groupLayers = {};
        var defaultGroupName = 'Map Overlays';
        app.data.filters.filter(function (f) {
            return f.thematicLayer === true;
        }).map(function (f) {
            if (f.fixed) {
                f.visible = true;
            };

            f.layerGroup = f.layerGroup || defaultGroupName;
            if (!groupLayers[f.layerGroup]) {
                groupLayers[f.layerGroup] = [];
            }
            groupLayers[f.layerGroup].push(f);
        });
        ul.each(function () {
            var current = $(this);
            var uniq = '';
            if (current.hasClass('normal-filter-group')) {
                uniq = "1";
            } else if (current.hasClass('modal-filter-group')) {
                uniq = "2";
            }
            //render none option
            if (!app.ui.filter.enableSelectButton) {
                current.find('li:first').addClass('hide');
                current.append(app.ui.filter.createFilterDropdownThematicDeselect(uniq));
            }
            current.append('<li class="divider" role="separator"/>');
            for (var group in groupLayers) {
                var groupUniqueId = group.replace(/[^a-zA-Z0-9\-]/g, '');
                var currentGroup = groupLayers[group];
                var header = app.ui.filter.createFilterDropdownThematicHeader(group, groupUniqueId);
                current.append(header);
                if (group === defaultGroupName) {
                    current.append(app.ui.filter.createFilterDropdownThematicDeselect(uniq , groupUniqueId));
                }
                currentGroup.sort(function (a, b) {
                    a.order = a.order || 0;
                    b.order = b.order || 0;
                    return b.order - a.order;
                });
                currentGroup.map(function (f) {
                    current.append(app.ui.filter.createFilterDropdownThematicItem(f, uniq , groupUniqueId));
                });
            };
        });
        //ul.append(this.createFilterDropdownThematicHeader());
        //ul.each(function() {
        //    var uniq = '';
        //    var current = $(this);
        //    if (current.hasClass('normal-filter-group')) {
        //        uniq = 1;
        //    } else if (current.hasClass('modal-filter-group')) {
        //        uniq = 2;
        //    }
        //    current.append(app.ui.filter.createFilterDropdownThematicDeselect(uniq));
        //    app.data.filters.filter(function(f) {
        //        return f.thematicLayer === true;
        //    }).forEach(function(f) {
        //        if( f.fixed ) { // always on
        //            f.visible = true;
        //        }
        //        current.append(app.ui.filter.createFilterDropdownThematicItem(f, uniq));
        //    });
        //});

        $(document).on('click', '#filter-panel', function (e) {
            e.stopPropagation();
        });

        app.ui.filter.fixFilterHeight();
    };
    this.restoreFilterFromCookies = function () {
        app.data.filters.forEach(function (f) {
            f.visible = f.visible || (f.defaultHidden ? false : true); // on by default
            f.visible = util.cookies.getBoolean(f.name, f.visible);
            f.visible = (f.fixed === true) || f.visible;
            app.data.setDataLayerVisibility(f.name, f.visible);
        }, this);

        app.ui.filter.updateFilterVisibility();

    }
    this.openFilterModal = function() {
        $('#filterModal').modal('show');
    };

    this.init = function () {

        if (document.body.clientWidth < 768) {
            $('#filter-dropdown-btn').removeAttr('data-toggle');
        }

        //this.initDropdown();

        $('.filterUnorderedList .select-default').on('click', function(ev) {
            app.ui.filter.updateButtonState('all');
            app.ui.filter.setDefaultFilters();
            app.ui.filter.setDefaultLayers();//only use for major incident dynamic filters.
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
