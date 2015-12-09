'use strict';

/* globals util: false */

var app = app || {};
app.ui = app.ui || {};
app.ui.watchZone = app.ui.watchZone || {};
(function() {

    this.DEFAULT_ZOOM_LEVEL = 8;
    this.radiuses = [    // [<textual appearance>, <measured in metres>]
        ['100 m' , 100],
        ['200 m' , 200],
        ['500 m' , 500],
        ['1 km'  , 1000],
        ['2 km'  , 2000],
        ['5 km'  , 5000],
        ['10 km' , 10000],
        ['20 km' , 20000],
        ['50 km' , 50000],
        ['100 km', 100000],
    ];
    this.zones = [];
    this.mode = 'idle';//idle, edit, new, view.
    this.current = {};
    this.newZone = null;

    this.resetDefault = function () {
        this.removeIndicators();
        this.current = {
            name: '',  //using to display edit form
            center: null,  // will be initialised by a latlng value
            radiusMeter: 10 * 1000, //default 10km
            marker: null,  // will be initialised by Leaflet Marker
            circle: null   // will be initialised by Leaflet Circle
        }
    }


    this.setMode = function (mode) {
        this.mode = mode;
        //more stuff will comming here
    }
    //if watchZone is passing to start function, init editing flow.
    this.start = function (center, watchZone, currentMode) {

        this.resetDefault();
        if (!currentMode) currentMode = 'new';
        this.setMode(currentMode);

        this.current.center = center || app.map.getCenter();

        if (watchZone) {
            //when saving data, if id is not empty. it will update the item in the list.
            this.current.id = watchZone.id;
            this.current.center = {
                lat: parseFloat(watchZone.latitude),
                lng: parseFloat(watchZone.longitude)
            };
            this.current.radiusMeter = parseInt(watchZone.radius, 10);
            this.current.name = watchZone.name;
            this.current.enableNotification = watchZone.enableNotification;

        }
        if (this.mode == 'new' || this.mode == 'edit') {
            this.initClickListener();
        }
        this.showMarker(this.current.center);
        this.updateCircle();
        //app.map.setZoom(this.DEFAULT_ZOOM_LEVEL);
        if (this.mode =='edit' || this.mode == 'view') {
            app.map.panTo(this.current.center);
            //show edit popup?
            this.current.marker.openPopup();
        }
        app.map.fitBounds(this.current.circle.getBounds(), { maxZoom: 15, animate: true });

        this.hideWatchzoneList();
    }

    this.hideWatchzoneList = function () {
        //$('.dropdown.open .dropdown-toggle').dropdown('toggle');
        $("#watchzone-list").closest('.open').removeClass('open');
        $("#watchZoneModal").modal('hide');
    }

    this.viewItem = function (itemid) {
        var watchzone = app.user.profileManager.findWatchZone(itemid);
        if (watchzone) {
            app.ui.watchZone.start(null,watchzone , 'view')
        }
        else {
            //display message???
        }

    }
    this.isRemoveFromList = function (id, list) {

        var currentName = this.current.name;
        var match = list.filter(function (item) {
            return item.name == currentName;
        })
        if (match && match.length == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    this.deleteItem = function (itemid, callback) {
        app.ui.messageBox.confirm('Are you sure?', function () {
            app.user.profileManager.deleteWatchzone(itemid,
                function (data, newWZList) {
                    app.ui.messageBox.info({
                        message: 'You watch zone has been removed.',
                        showClose: true
                    })
                    //if delete current view item, clear screen after delete successfull
                    if (app.ui.watchZone.isRemoveFromList(itemid, newWZList)) {
                        app.ui.watchZone.finish();
                    }
                    app.ui.watchZone.addToList(newWZList)
                },
                function () { });
        })
        return false;
    }
    this.editItem = function (id) {
        if (app.ui.watchZone.allowAddOrEdit()) {
            if (id) {
                var watchzone = app.user.profileManager.findWatchZone(id);
                if (watchzone) {
                    this.start(null, watchzone, 'edit')
                }
                else {
                    //display message???
                }
            }
        }

    }

    this.allowAddOrEdit = function () {
        if (this.mode=='edit') {
            app.ui.messageBox.info({ message: 'You are editing a watch zone. please save or cancel the current work before start new one.', showClose:true});
            return false;
        }
        else {
            if (this.mode=='new') {
                app.ui.messageBox.info({
                    message: 'You are creating new watch zone, please cancel or finish the process.', showClose: true
                })
                return false;
            }
        }
        return true;
    }
    this.restoreFromSession = function () {
        if (app.map && app.session.watchZone) {
            var sessionWatchZone = app.session.watchZone;
            switch (sessionWatchZone.mode) {
                case 'edit':
                    this.editItem(sessionWatchZone.id);
                    break;
                case 'view':
                    this.viewItem(sessionWatchZone.id);
                    break;
                case 'create':
                    this.start();
                    break;
                default:

            }
        }
        //app.session.setWatchZone(null);//clear session
    }

    this.onWatchZoneItemClick = function (ev) {
        ev.preventDefault();
        var el = $(this);
        var id = el.attr('item-id');
        var itemMode = el.attr('trigger-mode');

        if (!app.map && itemMode!= 'delete') {
            app.session.setWatchZone({
                'id': id,
                mode: itemMode
            });

            window.location = app.ui.layout.getHomeURL() + '/';
            return;
        }
        switch (itemMode) {
            case 'edit':
                app.ui.watchZone.editItem(id)
                break;
            case 'delete':
                app.ui.watchZone.deleteItem(id);
                break;
            case 'view':
                app.ui.watchZone.viewItem(id);
                break;
            /*case 'watchfilter':
                app.ui.watchZone.changeWatchzoneFilter(id);
                break;*/
            default:

        }
        ev.stopPropagation();
        return false;
    }
    this.addToList = function (watchZones) {
        if (watchZones && watchZones.length > 0) {
            var list = ['#watchzone-list', '#xs-watchzone-list'];
            list.forEach(function (item) {
                var watchZonesList = $(item);
                watchZonesList.find('.watchzone-item').remove();
                $(".watchzone-count").html(watchZones.length).removeClass('hide');

                for (var i = 0; i < watchZones.length; i++) {
                    var template = app.templates.watchzone.listitem(watchZones[i]);
                    watchZonesList.append(template);
                }
            });

            $('.watch-zone-item-trigger').unbind('click').click(this.onWatchZoneItemClick);
            $("input.watch-zone-item-toggle-notification").bootstrapSwitch({
                size: "mini",
                onSwitchChange: function (event, state) {
                    event.preventDefault();
                    $(event.target).prop('checked', state)
                    app.ui.watchZone.toggleItemNotification(event.target, state);
                    return false;
                }
            });//;
        }
        else {

        }
    }

    this.toggleItemNotification = function (e, state) {
        var itemid = $(e).attr('item-id');
        var watchzone = app.user.profileManager.findWatchZone(itemid);
        watchzone.enableNotification = state;
        if (watchzone) {
            app.ui.loading.show(true); //lock ui
            app.user.profileManager.addOrUpdateWatchzone(watchzone,
            function (watchzone, wzList) {

                //close all edit/new/view instance.
                app.ui.watchZone.finish();
            },
            function () {
                //show message???

            });
        }
    }
    this.save = function() {
        //util.cookies.set('zones',JSON.stringify(this.zones));value = mySlider.slider('getValue');
        var watchzone = {
            name: $('#txt-watchzone-name').val(),
            radius: this.current.radiusMeter,
            latitude: this.current.center.lat,
            longitude: this.current.center.lng,
            enableNotification: true,
            id: this.current.id
        }

        if (this.mode == 'edit') {
            watchzone.enableNotification = $('#chk-watch-zone-notification').prop('checked');

            app.user.profileManager.addOrUpdateWatchzone(watchzone,
                function (data) {
                    if (data.result) {
                        app.ui.messageBox.info({
                            message: 'Your watch zone has been updated.',
                            showClose: true,
                            onClose: function () {
                                app.ui.watchZone.finish();
                            }
                        })

                    }
                    if (data.err) {
                        //display message????
                    }
                    //app.ui.watchZone.finish();
                },
                function () { })
        }
        else {
            app.user.profileManager.addOrUpdateWatchzone(watchzone,
                function (data) {
                    if (data.result) {
                        $('.watchzone-editor').addClass('watchzone-editor-created');
                        $("#zw-created-name").html(watchzone.name);
                    }
                    if (data.err) {
                        //display message????
                    }
                    //app.ui.watchZone.finish();
                },
                function () { }
                );
        }
    };

    this.cancel = function() {
        if( this.circle ) {
            app.map.removeLayer(this.circle);
        }
        this.circle = null;
    };

    this.bestFit = function() {
        var best = 100;
        [100,200,500,1000,2000,5000,10000,20000,50000,100000,200000].forEach(function(rad){
            var circle = L.circle(app.map.getCenter(), rad);
            if( app.map.getBounds().contains(circle.getBounds()) ) {
                best = rad;
            }
        });
        return best;
    };

    this.validateWZName = function (value) {
        //var value = $el.val();
        if (!value || value.length < 4) return true;
        value = value.replace(/^\s+|\s+$/gm, '');
        var list = app.user.profileManager.userProfile.watchZones;
        var found = false;
        if (list && list.length > 0) {
            for (var i = 0; i < list.length && !found; i++) {
                if (list[i].name.toLowerCase() == value.toLowerCase() &&
                    list[i].id != this.current.id) {
                    found = true
                }
            }
        }
        return !found;
    }

    this.onEditorOpen = function (ev) {
        //check if current popp is editor then init editor
        if (!ev.popup || this.mode == 'idle') {
            return;
        }

        var leaflet_id = ev.popup._leaflet_id;
        if (leaflet_id === this.current.marker._popup._leaflet_id) {
            this.initWatchZonePopup(ev)
        }
    }
    this.initWatchZonePopup = function (e) {
        if (this.mode == 'edit') {
            //setup editing form
            $("#txt-watchzone-name").val(this.current.name);
            $('.watchzone-editor').addClass('watchzone-editor-update');
            $("#chk-watch-zone-notification").prop('checked', this.current.enableNotification)
        }

        $("#chk-watch-zone-notification").bootstrapSwitch({
            size: "mini",
            onSwitchChange: function (event, state) {
                event.preventDefault();
                $("#chk-watch-zone-notification").prop('checked', state)
                return false;
            }
        });

        var radius = this.current.radiusMeter / 100;
        $('#distanceSlider').slider({
            tooltip: 'always',
            value: radius,
            formatter: function (value) {
                return value / 10;//+ ' km';
            }
        });

        $('#distanceSlider').on('slideStop slide', function (evt) {
            $('#distanceSlider').val(evt.value);
            //slider is set from 1-1000. need mutiple it to 100 to make range from 0.1km to 100km.
            app.ui.watchZone.updateCircle(evt.value * 100)
        });

        $('#watchzone-editor-form').validator({
            disable: false,
            custom: {
                unique: function ($el) {
                    return app.ui.watchZone.validateWZName($el.val());
                }
            },
            errors :{
                unique: 'Watch zone name must be unique',
            }
        }).on('submit', function (e) {
            if (e.isDefaultPrevented()) {
                e.preventDefault(e);
                return false;
            }
            else {
                e.preventDefault(e);
                app.ui.watchZone.save();
                return false;
            }
        });
        //cancel the current item/ (edit/new/view)
        $('.watch-zone-cancel-trigger').off('click').click(function (e) {
            e.preventDefault();
            app.ui.watchZone.finish();
        });

        $('.watch-zone-item-trigger').off('click').click(this.onWatchZoneItemClick);
    }
    this.relocateMarker = function(event){
    }
    this.showMarker = function (latlng) {
        //var watchZoneIcon = L.icon(
        //    {
        //        iconUrl: './images/app-icons/watchzone.png',
        //        iconAnchor: [15, 15],
        //        popupAnchor: [0, 0]
        //    });
        var watchZoneIcon = L.divIcon({
            className: 'icon-controls-watchzone',
            iconAnchor: [15, 15],
            popupAnchor: [0, 0],
            iconSize : [30,30]
        });

        var dragable = this.mode == 'new' || this.mode == 'edit';

        if (this.current.marker === null) {
            this.current.marker = L.marker(latlng, {
                icon: watchZoneIcon,
                draggable: dragable
            });

            this.current.marker.on('dragend drag', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
                //app.map.panTo(new L.LatLng(position.lat, position.lng))
                app.ui.watchZone.current.center = position;
                app.ui.watchZone.updateCircle();
            });
            var template = this.mode == 'view' ? app.templates.watchzone.viewer : app.templates.watchzone.editor;

            var proxyObj = this.current;
            this.current.marker.bindPopup(template(this.current));

            this.current.marker.addTo(app.map);
            //this.current.marker.openPopup();
        } else {
            app.ui.watchZone.current.marker.setLatLng(latlng);
            if (app.ui.watchZone.current.circle!==null) {
                app.ui.watchZone.current.circle.setLatLng(latlng);
            }
        }
        app.ui.watchZone.current.center = latlng;
    };
    this.getCircleStyle = function () {
        //maybe different style depend on mode/area...

        return {
            fill: true,
            color: '#5881a2',
            fillOpacity: 0.3,
            opacity: 0.3,
            stroke: false,
            weight: 10,
            className:'emv-wz-circle'
        }
    };

    this.updateCircle = function (newRadius) {
        if (newRadius) {
            this.current.radiusMeter = newRadius;
        }

        var radius = this.current.radiusMeter; //radius metter unit is metter.
        var center = this.current.center;

        if (this.current.circle === null) {
            this.current.circle = L.circle(center, radius, this.getCircleStyle()).addTo(app.map);
        } else {
            this.current.circle.setLatLng(center);
            this.current.circle.setRadius(radius);
        }
    };

    this.onMapClick = function (ev) {
        var mode = app.ui.watchZone.mode;
        if (mode == 'new'  || mode == 'edit') {
            app.ui.watchZone.showMarker(ev.latlng);
        }
    }
    this.initClickListener = function () {
        if (app.map) {
            app.map.on('click', this.onMapClick);
        }
    };

    this.removeIndicators = function () {
        if (!this.current) return;

        if (this.current.marker) {
            app.map.removeLayer(this.current.marker);
        }
        if (this.current.circle) {
            app.map.removeLayer(this.current.circle);
        }

        this.current.marker = null;
        this.current.circle = null;
    };

    this.finish = function () {
        this.setMode('idle');
        this.removeIndicators();
    };

    this.init = function () {
        this.resetDefault();
        $('.watchzone-create-trigger').on('click', function (ev) {
            ev.preventDefault();

            //if not on map page, set session then redirecto map page
            if (!app.map) {
                app.session.setWatchZone({
                    mode: 'create'
                });
                window.location = app.ui.layout.getHomeURL() + '/';
                return false;
            }

            if (app.user.profileManager.canAddWatchZone()) {
                if (app.ui.watchZone.allowAddOrEdit()) {
                    app.ui.watchZone.start();
                }
            }
            else {
                app.ui.messageBox.info({
                    message: app.templates.watchzone.messages.reachlimit({
                        limit: app.user.profileManager.WATCH_ZONES_LIMIT_PER_USER }),
                    showClose: true
                });
            }
            ev.stopPropagation();
            return false;
        });

        $("#watchzone-list").on('click.bs.dropdown', function (e) {
            e.stopPropagation();
        });

    };

}).apply(app.ui.watchZone);
