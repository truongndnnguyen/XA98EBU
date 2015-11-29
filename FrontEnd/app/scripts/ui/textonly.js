'use strict';

var textonly = textonly || {};
(function() {

    this.showSortFilterSearchButtons = function() {
        $('#FilterDD').css('display', 'block');
        $('#frmSearch').css('display', 'block');
    };

    this.changeFilter = function(e) {
        var selText = $(this).text();
        $(this).parents('.dropdown').find('#btnFilter').html(selText + ' ' + '<i class="fa fa-caret-down"></i>');
        switch (selText) {
            case 'Warnings':
                $('.warning').show();
                $('.not-warning').hide();
                break;
            case 'Incidents':
                $('.not-warning').show();
                $('.warning').hide();
                break;
            default:
                $('.not-warning').show();
                $('.warning').show();
                break;
        }
        e.preventDefault();
    };

    this.init = function(staticData) {
        $('#filter-selection-menu li a').click(textonly.changeFilter);
        $('#filter-list').removeClass('hidden');
        $('#bs-footer-navbar-collapse').addClass('collapse');
        $('#bs-footer-navbar-collapse').addClass('navbar-collapse');

        if( staticData !== true ) {
            $(function() {
                $.getJSON('/public/osom-geojson.json', function(data) {
                    var rows = [];
                    $.each(data.features, function(key, features) {
                        var cls = features.properties.feedType;
                        if( cls !== 'warning' ) {
                            cls = 'not-warning';
                        }
                        rows.push('<tr class="'+cls+'"><td>' + features.properties.category1 + '</td>' + //('<tr><td>Icon</td>'+
                            '<td>' + features.properties.status + '</td>' + '<td>' + features.properties.location + '</td>' + '<td>' + features.properties.updated + '</td></tr>');
                        //'<td>'+ features.properties.sizeFmt+'</td>' );
                        //'<td><button type="button" class="btn btn-link">More Info</button></td></tr>');
                    });
                    $('#textonly-table > tbody').html(rows);
                });
            });
        }
    };

}).apply(textonly);
