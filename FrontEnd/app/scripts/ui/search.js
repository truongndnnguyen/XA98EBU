'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.search = app.ui.search || {};
(function() {

    this.onLocationChanged = function(label, latLng) {
        app.data.setReferenceLocation({
            latLng: latLng,
            label: label
        });
    };

    this.initTypeahead = function() {
        $.support.cors = true;
        var $input = $('#typeahead-input');

        $input.on('focus', function() {
            if ($(this).val() === '') {
                app.ui.search.buildHistoryList($input);
            }
        });
        $input.typeahead({
            source: function (query, process) {
                if(query !== '') {
                    app.ui.search.destroyHistoryList();
                }
                var opts = {
                    fields: ['postcode^10000','locality^10000','feature^500','address']
                };
                var url = '/2013-01-01/search';
                url += '?size=20&q.options=' + encodeURIComponent(JSON.stringify(opts));
                url += '&q=' + encodeURIComponent(''+query+'* |"'+query+'"');
                return $.get(url, function (data) {
                    var hitCache = {};
                    var filteredResults = data.hits.hit.filter(function(hit){
                        hit.title = hit.fields.address || hit.fields.locality || hit.fields.feature || hit.fields.postcode;
                        if (hit.title === undefined || (hit.title in hitCache) ) {
                            return false;
                        }
                        hitCache[hit.title] = true;
                        return true;
                    }).map(function(hit) {
                        return {
                            name: hit.title,
                            latlng: hit.fields.latlng
                        };
                    });
                    return process(filteredResults);
                });
            },
        })
        $input.on('keyup', function() {
            if($(this).val() ==='') {
                app.ui.search.buildHistoryList($input);
            }
        })
        $input.change(function(event){
            if (event.isTrigger) {
                var current = $input.typeahead('getActive');
                var latlng = current.latlng.split(/,/);
                for ( var i = 0; i <latlng.length; i++ ) {
                    latlng[i] = 1 * latlng[i];
                }
                app.ui.search.showSearchResult(current.name, latlng);
                app.ui.search.addToSearchHistory(current.name,latlng);
            } else {
                $('#search-perform-btn').click(function(){
                    var current = $input.typeahead('getActive');
                    var latlng = current.latlng.split(/,/);
                    for ( var i = 0; i <latlng.length; i++ ) {
                        latlng[i] = 1 * latlng[i];
                    }
                    app.ui.search.showSearchResult(current.name, latlng);
                    app.ui.search.addToSearchHistory(current.name,latlng);
                });
            }
        });
        $input.on('blur', function() {
            setTimeout(function() {
                app.ui.search.destroyHistoryList();
            }, 300);
        });
    };

    this.lastMarker = null;

    this.showSearchResult = function(label, latlng) {
        if (this.lastMarker) {
            app.map.removeLayer(this.lastMarker);
        }
        this.lastMarker = L.marker(latlng);

        var htmlLabel = app.templates.searchmarker({ 'label': label, latlng: latlng });

        this.lastMarker.addTo(app.map)
            .bindPopup(htmlLabel)
            .openPopup();
        $("#search-create-watch-zone-btn").click(function (ev) {
            app.map.removeLayer(app.ui.search.lastMarker);
            app.ui.search.lastMarker = null;
            app.ui.watchZone.start({
                lat: latlng[0],
                lng: latlng[1]
            });
        });
        $('.search-pin-popup').closest('.leaflet-popup').find('.leaflet-popup-close-button').hide();

        if (app.ui.layout.getActiveState() === 'list') {
            /* List view: zoom out so that all incidents can be displayed (Story 312 AC03) */
            app.map.setView(latlng, 6);
        } else {
            /* Map view: zoom in */
            app.map.setView(latlng, 14);
        }
        this.onLocationChanged(label, L.latLng(latlng));
    };

    this.addToSearchHistory = function(label, latlng) {
        var newarray = [{name:label, latlng :latlng}];

        for(var i=0;i< this.histories.length ; i++ ){
            if(this.histories[i].name !== label) {
                newarray.push(this.histories[i])
            }
        }
        this.histories  = newarray.slice(0,4);
        util.cookies.set('empublic-search', JSON.stringify(this.histories), 364);
        //this.buildHistoryList();
    };

    this.buildHistoryList = function(input) {
        if (this.histories.length === 0) {
            return;
        }
        app.ui.search.destroyHistoryList();
        /*destroy and rebuild list of past searches*/
        var ul = $('<ul class="typeahead savedHistoryList dropdown-menu" role="listbox"></ul>');
        for (var j = 0; j < this.histories.length; j++) {
            var item = this.histories[j];
            var li = $('<li><a href="#" role="option" label="'+item.name+'" index="' + j+'" lat="' + item.latlng[0]+'" lng="' + item.latlng[1]+'">'+
                    '<strong>' + item.name +'</strong>'+
                    '</a></li>')
            ul.append(li);
        }
        ul.insertAfter(input);

        /*handle past search map functionality*/
        $('.savedHistoryList').show();
        $('.savedHistoryList>li>a').on('click', function(e) {
            e.preventDefault();
            $('#typeahead-input').val($(this).attr('label'));
            var item = app.ui.search.histories[parseInt($(this).attr('index'), 10)];
            app.ui.search.showSearchResult(item.name, item.latlng);
            app.ui.search.addToSearchHistory(item.name, item.latlng);
        });
    };

    this.destroyHistoryList = function() {
        $('.savedHistoryList').remove();
    };

    this.loadHistoryFromCookies = function() {
        var lastSearch = util.cookies.get('empublic-search');
        if(lastSearch  === '' || lastSearch == null) {
            return [];
        }
        return JSON.parse(lastSearch);
    };

    this.histories = [];

    this.init = function() {
        this.histories = this.loadHistoryFromCookies();
        this.initTypeahead();
    };

}).apply(app.ui.search);
