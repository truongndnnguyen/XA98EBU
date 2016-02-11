'use strict';

/* globals util: false */

var app = app||{};
app.data = app.data||{ totalWarnings :0, totalOthers :0};
app.data.controller = app.data.controller||{};

/*
    Data Controller Interface

    this.getLayerForFilter(filterName);
    this.getDataLayers();
    this.getLayer(id);
    this.refreshData(callback);
    this.recalculateDistanceToReferenceLocation;
    this.shareClusterLayer - this is cluster layer using for multiple controller, purpose of this is make sure clustering icon work with multiple data source.
    this.clusterName //come with shareClusterLayer, that allow to remove all marker from share cluster when refresh happend.
*/

app.data.controller.geojson = function(options) {
    $.extend(this, options);
    var thisController = this;
    //this.shareLayerGroupName;
    this.loaded = false;
    this.clusters = {};
    this.clusterLayer = app.data.createMarkerCluster('layer cluster');
    this.totalWarnings = 0;
    this.totalOthers = 0;
    this.refreshInterval = function() {
        return 10 * 1000;
    };

    this.updateFilters = function (filters) {
        var currentFilters = this.filters;

        var notexistFilter = filters.filter(function (f) {
            var list = currentFilters.filter(function (f1) {
                return f1.name == f.name;
            });
            return list.length == 0;
        });

        this.filters = this.filters.concat(notexistFilter);

        notexistFilter.map(function (f) {
            this.clusters[f.name] = {
                layer: app.data.createMarkerCluster(f.name),
                geoJson: {
                    features: [],
                    'type': 'FeatureCollection'
                },
                data: null
            };
        }, this);

    }
    this.filters.map(function(f){
        this.clusters[f.name] = {
            layer: app.data.createMarkerCluster(f.name),
            geoJson: {
                features: [],
                'type': 'FeatureCollection'
            },
            data: null
        };
    },this);

    this.getDataLayers = function() {
        return this.filters.filter(function(f){
            return this.clusters[f.name].data !== null;
        }, this).map(function(f){
            return this.clusters[f.name].data;
        }, this);
    };

    this.getAllFeatures = function() {
        return this.clusteredFeatures;
    };

    this.getVisibleDataLayers = function () {
        return this.filters.filter(function(f){
            return (this.clusters[f.name].data !== null) && f.visible;
        }, this).map(function(f){
            return this.clusters[f.name].data;
        }, this);
    };

    this.getLayer = function(id) {
        var layers = this.getDataLayers().map(function(f){
            return f.getLayer(id);
        }).filter(function(f){
            return f;
        }).map(function(layer) {
            if( layer.feature.geometry.type === 'GeometryCollection' ) {
                return layer.getLayers().filter(function(f){
                    return f.getPopup && f.getPopup();
                })[0];
            }
            return layer;
        }).filter(function(f){
            return f;
        });
        return layers.length>0 ? layers[0] : null;
    };

    this.removeDuplicatePolygons = function (geojson, polygon) {
        var newgeojson = {
            type: 'FeatureCollection',
            features: []
        };
        //newgeojson.features = [];

        geojson.features.map(function (f) {
            if ((f.geometry.type == 'Polygon' || f.geometry.type =='MultiPolygon') && f.geometry.name) {
                if (!polygon[f.geometry.name]) {
                    polygon[f.geometry.name] = f.geometry.name;
                    newgeojson.features.push(f);
                }
                else {
                    var coord = f.primaryFeature.geometry;
                    delete f.primaryFeature;
                    delete f.extendedFeature;
                    f.geometry = coord;
                    newgeojson.features.push(f);
                }
            }
            else {
                newgeojson.features.push(f);
            }
            //return f;
        })
        return newgeojson;
    }
    this.batchUpdateDataLayerVisibility = function () {
        //dirty cheat, not sure if there a better way to do.
        var fdr = app.data.filters.filter(function (p) {
            return p.rules && p.rules.match && p.rules.match(/fire-danger-rating/g) && p.visible === true;
        });
        var isFDRShowing = fdr && fdr.length > 0;

        if (!this.shareClusterLayer) {
            app.map.removeLayer(this.clusterLayer);
<<<<<<< HEAD
            this.clusterLayer.clearLayers()
        }
        else {
            //only remove the layer belong to current controller using ClusterName tagged to feature.
            this.shareClusterLayer.getLayers().filter(function (f) {
                return f.feature && f.feature.clusterName == thisController.clusterName;
            }).map(function (f) {
                thisController.shareClusterLayer.removeLayer(f);
            });
        }
        if (!this.clusteredFeatures) {
=======
            this.clusterLayer.clearLayers();
        }
        else {
            //cleanup shareCluster
            this.shareClusterLayer.getLayers().filter(function (l) {
                return l.feature && l.feature['layerGroupName'] == thisController.layerGroupName;
            }).map(function (l) {
                thisController.shareClusterLayer.removeLayer(l);
            });
        }
        if( ! this.clusteredFeatures ) {
>>>>>>> 94d42be305d0ee79f7c4e5dd37375f066cd068ab
            return;
        }

        var visibleFilters = {};
        this.filters.filter(function(f){
            return f.isolateCluster !== true;
        }).map(function (f) {
            //if fire danger rating is showing, remove all other warning/incidents #390
            visibleFilters[f.name] = ( !f.name.match(/Fire Danger Rating/g) && isFDRShowing) ? false : f.visible;
            this.clusters[f.name].geoJson.features = [];
        }, this);
        // categorise the features into separate geojson feature collections
        this.clusteredFeatures.map(function(feature){
            var cls = thisController.classifyFeature(feature);
            var pushed = false;
            if( cls && cls.categories ) {
                cls.categories.forEach(function (category) {
                    if (visibleFilters[category] && !pushed) {
                        thisController.decomposeGeometryCollection(feature).forEach(function (f) {
                            this.clusters[category].geoJson.features.push(f);
                        }, this);
                        pushed = true;
                    }
                }, this);
            }
        }, thisController);

        var polygon = {};
        // create clusters of the data
        this.filters.filter(function(f){
            return f.visible && f.isolateCluster !== true;
        }).map(function (f) {
            var cls = this.clusters[f.name];
<<<<<<< HEAD
            var geojson = thisController.removeDuplicatePolygons(cls.geoJson, polygon);
            geojson.features.map(function (f) {
                f.clusterName = thisController.clusterName; //tag feature to a controller name that can be removed later.
            });
            cls.data = L.geoJson(geojson, this.geoJsonOptions);
            if (this.shareClusterLayer) {
                this.shareClusterLayer.addLayer(cls.data);
            }
            else {
                this.clusterLayer.addLayer(cls.data)
            }
        }, thisController);

        if (this.shareClusterLayer && !this.shareClusterLayer._map) {
            app.map.addLayer(this.shareClusterLayer);
        }
        else{
            app.map.addLayer(this.clusterLayer);
        }
=======
            cls.geoJson.features.map(function (f) { f.layerGroupName = thisController.layerGroupName });
            cls.data = L.geoJson(cls.geoJson, this.geoJsonOptions);
            //cls.data['layerGroupName'] = thisController.layerGroupName;
            if (!this.shareClusterLayer) {
                this.clusterLayer.addLayer(cls.data);
            }
            else {
                this.shareClusterLayer.addLayer(cls.data);
            }
        },thisController);

        if (!this.shareClusterLayer) {
            app.map.addLayer(this.clusterLayer);
        }
        else {
            if (!this.shareClusterLayer._map) {
                app.map.addLayer(this.clusterLayer);
            }
        }
>>>>>>> 94d42be305d0ee79f7c4e5dd37375f066cd068ab
        // deal with isolated clusters
        this.filters.filter(function(f){
            return f.isolateCluster;
        }).forEach(function (f) {
            if( f.visible ) {
                app.map.addLayer(this.clusters[f.name].layer);
            } else {
                app.map.removeLayer(this.clusters[f.name].layer);
            }
        }, this);

        if (this.afterUpdateMapElements) {
            this.afterUpdateMapElements();
        }

    }

    this.fastPollRefreshData = function(callback) {
        if( ! this.fastPollUrl ) {
            return callback(false);
        }
        var url = (typeof this.fastPollUrl === 'function') ? this.fastPollUrl.call() : this.fastPollUrl;
        var thisController = this;

        $.ajax({
            type: 'HEAD',
            async: true,
            timeout: 10000,
            url: url
        }).done(function(message,text,xhr){
            var lm = xhr.getResponseHeader('Last-Modified');
            if( lm && thisController.lastModified && lm !== thisController.lastModified ) {
                callback(true);
            } else {
                callback(false);
            }
            thisController.lastModified = lm;
        }).error(function() {
            callback(false);
        });
    };

    this.refreshData = function(callback) {
        $.ajax({
            cache: false,
            url: (typeof this.url === 'function') ? this.url.call() : this.url,
            dataType: 'json',
            beforeSend: function() {
                if( thisController.primaryInteractionLayer ) {
                    app.ui.refreshManager.setRefreshing(true);
                }
            },
            error: function() {
                if(thisController.majorDataFailed){
                    thisController.majorDataFailed();
                }
                else{
                    app.ui.alert.error(thisController.errorMessage || 'Unable to load the latest warnings and incidents information');
                    if( thisController.primaryInteractionLayer ) {
                        app.ui.refreshManager.setRefreshing(false);
                    }
                }
                callback(thisController);
            },
            success: function (data) {
                if (thisController.buildDynamicFilters) {
                    //this code build dynamic filter for major incident page
                    thisController.buildDynamicFilters(data, thisController);
                }

                if (data.geoJson) {
                    thisController.processData(data.geoJson);
                } else {
                    thisController.processData(data);
                }
                if(thisController.extendDataProcess) {
                    thisController.extendDataProcess(data);
                }
            },
            complete: function() {
                callback(thisController);
            }
        });
    };

    // consolidate a collection of geometries consisting of multiple points (and polygons etc)
    // into a single point at the center of the bounding box containing all points, plus the
    // other features (polygons etc).
    this.consolidateGeometryCollectionFeature = function (feature) {
        var points = feature.geometry.geometries.filter(function(f) {
            return f.type === 'Point';
        }).map(function(f) {
            return [f.coordinates[1], f.coordinates[0]];
        });
        if( ! points.length ) {
            return;
        }
        var bbox = L.latLngBounds(points[0], points[0]);
        points.forEach(function(f) {
            bbox.extend(f);
        });
        var center = bbox.getCenter();
        var coords = [center.lng, center.lat];
        feature.geometry.geometries = feature.geometry.geometries.filter(function(f) {
            return f.type !== 'Point';
        }).concat({
            type: 'Point',
            coordinates: coords
        });
    };

    // if a geometrycollection contains other geometrycollections, flatten them down into a single collection
    this.normaliseGeometryCollectionFeature = function (feature) {
        feature.geometry.geometries = feature.geometry.geometries.map(function(geom){
            if( geom.type === 'GeometryCollection' ) {
                return geom.geometries;
            } else {
                return [geom];
            }
        }).reduce(function(a,b){
            return [].concat(a,b);
        });
    };

    this.decomposeGeometryCollection = function (feature) {
        if( feature.geometry.type === 'GeometryCollection' ) {
            if( ! feature.geometry.geometries ) {
                return [feature];
            }
            var points = feature.geometry.geometries.filter(function(g){ return g.type === 'Point'; });
            if( points && points.length ) {
                if( points.length > 1 ) {
                    var fs = feature.geometry.geometries.map(function(geom){
                        var f = $.extend({}, feature);
                        f.geometry = geom;
                        return f;
                    });
                    var primary = null, i, allPoints=true;
                    for(i=0; i<fs.length; i++) {
                        if(fs[i].geometry.type !== 'Point') {
                            allPoints = false;
                        }
                    }
                    for(i=0; i<fs.length; i++) {
                        if(fs[i].geometry.type === 'Point') {
                            primary = fs[i];
                            break;
                        }
                    }
                    for(i=0; i<fs.length; i++) {
                        if( fs[i].geometry.type === 'Point' ) {
                            primary = fs[i];
                        } else {
                            fs[i].primaryFeature = primary;
                        }
                        if( (i !== fs.length-1) && !allPoints ) {
                            fs[i].extendedFeature = fs[i+1];
                        }
                    }
                    return fs;
                }

                var f1 = $.extend({}, feature), f2 = $.extend({}, feature);
                f1.geometry = points[0];
                // //mdj multipoint support, could roll back
                // if( points.length>1 ) {//multipoint?
                //     f1.geometry = {
                //         type: 'MultiPoint',
                //         coordinates: points.map(function(geom){
                //             return geom.coordinates;
                //         })
                //     };
                // } else {
                //     f1.geometry = points[0];
                // }
                var notPoints = f2.geometry.geometries.filter(function(g){ return g.type !== 'Point'; });
                if( notPoints && notPoints.length ) {
                    if( notPoints.length > 1 ) { //geometrycollection
                        f2.geometry.geometries = notPoints;
                    } else {
                        f2.geometry = notPoints[0];
                    }
                    f2.primaryFeature = f1;
                    f1.extendedFeature = f2;
                    return [f1, f2];
                } else {
                    return [f1]; // deals with geometry collections that only contain points
                }
            } else {
                return [feature];
            }
        } else {
            return [feature];
        }
    };

    this.processData = function (data) {
        var persistentPath = util.history.hasPath() ? util.history.getPath() : null;
        if (this.beforeProcessData) {
            this.beforeProcessData(data);
        }
        /* Clear existing features and layers */
        for (var i = 0; i < this.filters.length; i++) {
            var cluster = this.clusters[this.filters[i].name];
            if (cluster.geoJson.features.length > 0) {
                cluster.geoJson.features = [];
                cluster.layer.clearLayers();
                cluster.data = null;
            }
        }
        //this.clusterLayer.clearLayers();

        // filter and sort the raw feature data using provided functions
        if( this.dataFilter ) {
            data.features = data.features.filter(this.dataFilter);
        }

        this.totalOthers = 0;
        this.totalWarnings = 0
        if (this.featureCounter) {
            this.featureCounter(data, this);
        }
        else
        if (this.primaryInteractionLayer) {
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i];
                if (feature.properties.feedType === 'warning') {
                    this.totalWarnings++;
                } else if (feature.properties && feature.properties.feedType === 'incident') {
                    this.totalOthers++;
                }
            }
        }

        if( this.postprocessFeatures ) {
            this.postprocessFeatures(data.features);
        }
        if( this.featureSort ) {
            data.features.sort(this.featureSort);
        }

        // // flatten geometry collections for easier management
        // data.features.filter(function(feature) {
        //     return feature.geometry.type === 'GeometryCollection';
        // }).map(this.consolidateGeometryCollectionFeature);

        // normalise geometrycollections of geometrycollections
        data.features.filter(function(feature) {
            return feature.geometry && feature.geometry.type === 'GeometryCollection';
        }).map(this.normaliseGeometryCollectionFeature);

        // convienience to avoid repeatedly looking up the filter by name
        thisController.filters.map(function(filter) {
            this.clusters[filter.name].isolateCluster = filter.isolateCluster;
        }, thisController);

        // categorise the features into separate geojson feature collections, considering clustering requirements
        this.clusteredFeatures = [];
        data.features.map(function(feature){
            delete feature.classification;
            var cls = thisController.classifyFeature(feature);
            var pushed = false;
            if (cls && cls.categories) {
                cls.categories.forEach(function (category) {
                    if(this.clusters[category].isolateCluster ) {
                        thisController.decomposeGeometryCollection(feature).forEach(function(f){
                            this.clusters[category].geoJson.features.push(f);
                        }, this);
                    } else if( !pushed ) {
                        this.clusteredFeatures.push(feature);
                        pushed = true;
                    }
                }, this);
            }
        },thisController);

        // create clusters of the data
        thisController.filters.map(function(f){
            var cls = this.clusters[f.name];
            cls.data = L.geoJson(cls.geoJson, this.geoJsonOptions);
            cls.layer.addLayer(cls.data);
        },thisController);

        thisController.batchUpdateDataLayerVisibility();

        // update the distance from reference location
        this.recalculateDistanceToReferenceLocation();
        app.ui.sidebar.sync(true);

        if( thisController.primaryInteractionLayer ) {
            //  auto-select marker and panel when url contains incidentNo after hash
            if( persistentPath ) {
                util.history.setPath(persistentPath);
            }
            if(util.history.hasPath()) {
                app.ui.selection.selectByDeeplinkURL(util.history.getPath(), !this.loaded);
            }

            app.ui.refreshManager.setRefreshing(false);
            app.ui.refreshManager.setUpdatedDate(new Date());
        }
        this.loaded = true;
    };

    this.recalculateDistanceToReferenceLocation = function() {
        /* Update 'distanceTo' property on feature classifications */
        for (var i = 0; i < this.filters.length; i++) {
            var cluster = this.clusters[this.filters[i].name];
            for (var j = 0; j < cluster.geoJson.features.length; j++) {
                var feature = cluster.geoJson.features[j];
                feature.classification.distanceTo = app.data.describeDistanceToReferenceLocation(feature);
            }
        }
    };

    this.getId = function(cls) {
        var id = '0';
        if (cls.id) {
            id = cls.id
        } else if (cls.deeplinkurl) {
            id = cls.deeplinkurl;
        }
        return id;
    };

    this.geoJsonOptions = {
        style: function(feature) {
            return thisController.classifyFeature(feature).style;
        },
        pointToLayer: function(feature, latlng) {
            var cls = thisController.classifyFeature(feature);
            var assistiveText = cls.title + '. Location: ' + cls.location + '. Click for more information.';
            var marker = L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: null,
                    iconAnchor: [15, 15],
                    popupAnchor: [0, 0],
                    className: null,
                    iconClass: cls.iconClass,
                    html: cls.markerHTML || '<span class="gtm-data">' + thisController.getId(cls) + '</span>' + util.symbology.getIcon(cls.iconClass, false, assistiveText)
                }),
                zIndexOffset: cls.riskRating||0,
                title: null,
                riseOnHover: true,
                riseOffset: 2000

            });
            var template = app.templates.popup[cls.template] || app.templates.popup.other;
            marker.bindPopup(template(feature));
            marker.off('click');
            marker.on('click', function () {
                app.ui.selection.select(feature);
            });
            return marker;
        },
        onEachFeature: function(feature, layer) {
            feature.layer = layer;
            feature.latLng = (feature.geometry.type === 'Point') ? layer.getLatLng() : layer.getBounds().getCenter();
            var template, cls = thisController.classifyFeature(feature);

            if( cls.pointless ) {
                template = app.templates.popup[cls.template] || app.templates.popup.other;
                layer.bindPopup(template(feature));
            } else if( feature.primaryFeature ) {
                template = app.templates.popup[feature.primaryFeature.classification.template] || app.templates.popup.other;
                layer.bindPopup(template(feature.primaryFeature));
            }

            var handlers = {
                click: function () {
                    if( this.getBounds && feature.classification.unselectablePolygon === true ) {
                        app.ui.selection.deselect();
                    } else if( feature.primaryFeature ) {
                        app.ui.selection.select(feature.primaryFeature);
                    } else {
                        app.ui.selection.select(feature);
                    }
                }
            };
            layer.off('click');
            if(layer.getLayers) {
                layer.getLayers().forEach(function(lyr){
                    lyr.off('click');
                    lyr.on(handlers);
                });
            } else {
                layer.on(handlers);
            }
        }
    };

    this.init = function() {
    };

};
