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
    this.editedZone = {};
    this.newZone = null;

    this.resetDefault = function () {
        this.removeIndicators();
        this.editedZone = {
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

        this.editedZone.center = center || app.map.getCenter();

        if (watchZone) {
            //when saving data, if uuid is not empty. it will update the item in the list.
            this.editedZone.uuid = watchZone.uuid;
            this.editedZone.center = {
                lat: parseFloat(watchZone.latitude),
                lng: parseFloat(watchZone.longitude)
            };
            this.editedZone.radiusMeter = parseInt(watchZone.radius, 10);
            this.editedZone.name = watchZone.name;
            this.editedZone.enableNotification = watchZone.enableNotification;

        }
        if (this.mode == 'new' || this.mode == 'edit') {
            this.initClickListener();
        }
        this.showMarker(this.editedZone.center);
        this.updateCircle();
        //app.map.setZoom(this.DEFAULT_ZOOM_LEVEL);
        if (this.mode =='edit' || this.mode == 'view') {
            app.map.panTo(this.editedZone.center);
            //show edit popup?
            this.editedZone.marker.openPopup();
        }
        app.map.fitBounds(this.editedZone.circle.getBounds(), { maxZoom: 15, animate: true });

        this.hideWatchzoneList();
    }

    this.hideWatchzoneList = function () {
        //$('.dropdown.open .dropdown-toggle').dropdown('toggle');
        $("#watchzone-list").closest('.open').removeClass('open');
        $("#watchZoneModal").modal('hide');
    }

    this.viewItem = function (itemid) {
        var watchzone = app.user.profile.findWatchZone(itemid);
        if (watchzone) {
            app.ui.watchZone.start(null,watchzone , 'view')
        }
        else {
            //display message???
        }

    }
    this.isCurrent = function (id) {
        return this.editedZone.uuid === id;
    }

    this.deleteItem = function (itemid, callback) {
        app.ui.messageBox.confirm('Are you sure?', function () {
            app.user.profile.deleteWatchzone(itemid,
                function (data, newWZList) {
                    app.ui.messageBox.info({
                        message: 'You watch zone has been removed.',
                        showClose: true
                    })
                    //if delete current view item, clear screen after delete successfull
                    if (app.ui.watchZone.isCurrent(itemid)) {
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
                var watchzone = app.user.profile.findWatchZone(id);
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

    this.onWatchZoneItemClick = function (ev) {
        ev.preventDefault();
        var el = $(this);
        var id = el.attr('item-id');
        var itemMode = el.attr('trigger-mode');
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

            $('.watch-zone-item-trigger').click(this.onWatchZoneItemClick);
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
        var watchzone = app.user.profile.findWatchZone(itemid);
        watchzone.enableNotification = state;
        if (watchzone) {
            app.ui.loading.show(true); //lock ui
            app.user.profile.addOrUpdateWatchzone(watchzone,
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
            radius: this.editedZone.radiusMeter,
            latitude: this.editedZone.center.lat,
            longitude: this.editedZone.center.lng,
            enableNotification: true,
            uuid: this.editedZone.uuid
        }

        if (this.mode == 'edit') {
            watchzone.enableNotification = $('#chk-watch-zone-notification').prop('checked');

            app.user.profile.addOrUpdateWatchzone(watchzone,
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
            app.user.profile.addOrUpdateWatchzone(watchzone,
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

        var list = app.user.profile.userProfile.watchZones;
        var found = false;
        if (list && list.length > 0) {
            for (var i = 0; i < list.length && !found; i++) {
                if (list[i].name.toLowerCase() == value.toLowerCase() &&
                    list[i].uuid != this.editedZone.uuid) {
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
        if (leaflet_id === this.editedZone.marker._popup._leaflet_id) {
            this.initWatchZonePopup(ev)
        }
    }
    this.initWatchZonePopup = function (e) {
        if (this.mode == 'edit') {
            //setup editing form
            $("#txt-watchzone-name").val(this.editedZone.name);
            $('.watchzone-editor').addClass('watchzone-editor-update');
            $("#chk-watch-zone-notification").prop('checked', this.editedZone.enableNotification)
        }

        $("#chk-watch-zone-notification").bootstrapSwitch({
            size: "mini",
            onSwitchChange: function (event, state) {
                event.preventDefault();
                $("#chk-watch-zone-notification").prop('checked', state)
                return false;
            }
        });

        var radius = this.editedZone.radiusMeter / 100;
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
        $('.watch-zone-cancel-trigger').click(function (e) {
            e.preventDefault();
            app.ui.watchZone.finish();
        });

        $('.watch-zone-item-trigger').click(this.onWatchZoneItemClick);
    }
    this.relocateMarker = function(event){
    }
    this.showMarker = function (latlng) {
        var watchZoneIcon = L.icon(
            {
                iconUrl: './images/app-icons/watchzone.png',
                iconAnchor: [15, 15],
                popupAnchor: [0, 0]
            });
        var dragable = this.mode == 'new' || this.mode == 'edit';

        if (this.editedZone.marker === null) {
            this.editedZone.marker = L.marker(latlng, {
                icon: watchZoneIcon,
                draggable: dragable
            });

            this.editedZone.marker.on('dragend drag', function (event) {
                var marker = event.target;
                var position = marker.getLatLng();
                marker.setLatLng(new L.LatLng(position.lat, position.lng), { draggable: 'true' });
                //app.map.panTo(new L.LatLng(position.lat, position.lng))
                app.ui.watchZone.editedZone.center = position;
                app.ui.watchZone.updateCircle();
            });
            var template = this.mode == 'view' ? app.templates.watchzone.viewer : app.templates.watchzone.editor;

            var proxyObj = this.editedZone;
            this.editedZone.marker.bindPopup(template(this.editedZone));

            this.editedZone.marker.addTo(app.map);
            //this.editedZone.marker.openPopup();
        } else {
            app.ui.watchZone.editedZone.marker.setLatLng(latlng);
            if (app.ui.watchZone.editedZone.circle!==null) {
                app.ui.watchZone.editedZone.circle.setLatLng(latlng);
            }
        }
        app.ui.watchZone.editedZone.center = latlng;
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
            this.editedZone.radiusMeter = newRadius;
        }

        var radius = this.editedZone.radiusMeter; //radius metter unit is metter.
        var center = this.editedZone.center;

        if (this.editedZone.circle === null) {
            this.editedZone.circle = L.circle(center, radius, this.getCircleStyle()).addTo(app.map);
        } else {
            this.editedZone.circle.setLatLng(center);
            this.editedZone.circle.setRadius(radius);
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
        if (!this.editedZone) return;

        if (this.editedZone.marker) {
            app.map.removeLayer(this.editedZone.marker);
        }
        if (this.editedZone.circle) {
            app.map.removeLayer(this.editedZone.circle);
        }

        this.editedZone.marker = null;
        this.editedZone.circle = null;
    };

    this.finish = function () {
        this.setMode('idle');
        this.removeIndicators();
    };

    this.init = function() {
        this.resetDefault();
        this.initClickListener();
        $('.watchzone-create-trigger').on('click', function (ev) {
            ev.preventDefault();
            if (app.user.profile.canAddWatchZone()) {
                if (app.ui.watchZone.allowAddOrEdit()) {
                    app.ui.watchZone.start();
                }
            }
            else {
                app.ui.messageBox.info({
                    message: app.templates.watchzone.messages.reachlimit({
                        limit: app.user.profile.WATCH_ZONES_LIMIT_PER_USER }),
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
