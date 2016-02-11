'use strict';

/* globals app: false */
/* globals util: false */
/* jshint unused:false */

app.data.osom = app.data.osom || {};
(function () {
    this.POLYGON_CLASS_NAME = 'emv-polygon-path';

    //flag for local page
    this.isLocalPage = false;

    this.determinePage = function(view) {
        if (view === 'local') {
            this.isLocalPage = true;
        } else {
            this.isLocalPage = false;
        }
    }

    // fill patterns cache
    this.fillPatterns = {};
    this.currentFilters = [];

    this.isPointless = function (geometry) {
        if (geometry.type === 'GeometryCollection') {
            return geometry.geometries.filter(function (geom) {
                return !app.data.osom.isPointless(geom);
            }).length === 0;
        } else {
            return (geometry.type !== 'Point') && (geometry.type !== 'MultiPoint');
        }
    };

    /*this.matchAllRules = function (category) {
        var result = [];
        this.filterMappings.map(function (f) {
            var matches = f.rules.filter(function (item) {
                return item.toLowerCase() == category.toLowerCase();
            });
            if (matches.length > 0) {
                result.push({ name: f.name , priority: f.priority });
            }

        });
        if (result.length == 0) {
            result.push({ name: 'Others', priority:0})
        }
        return result;
    }*/

    this.classifyFeature = function (feature) {
        if (feature.classification) {
            return feature.classification;
        }
        if (!feature.properties || !feature.properties.feedType) {
            feature.classification = {};
            return feature.classification;
        }

        feature.properties.feedType = feature.properties.feedType || 'other';
        feature.properties.id = feature.properties.id || feature.properties.created;

        var iconClass = feature.properties.cssClass || 'other',
            alertClass = feature.properties.alertClass || null,
            template = feature.properties.feedType,
            sidebarTemplate = (app.data.osom.isLocalPage && feature.properties.feedType === 'warning') ? 'osom-major-'+feature.properties.feedType : 'osom-'+feature.properties.feedType,
            title = feature.properties.category1 || 'Unknown',
            subtitle = feature.properties.name || feature.properties.category2 || '',
            identifier = feature.properties.feedType + '/' + feature.properties.id,
            categories = [],
            categoryNames = ['Other'],
            riskRating = 0,
            headline = null,
            unlisted = false,
            pointless = false,
            unselectablePolygon = false;

            //utilise style metadata for major incidents only
            //var style = {};
            if (app.data.osom.isLocalPage) {
                var moreInformation = (feature.properties.url || feature.properties.webBody) ? true : false;
            } else {
                var moreInformation = (feature.properties.url || feature.properties.webBody || feature.properties.majorIncidentId) ? true : false;
            }
            if (feature.properties.style) {
                var style = {
                    //dashArray: feature.properties.style.dashstyle || null,
                    dashArray: null,
                    color: feature.properties.style.color || '#000',
                    opacity: feature.properties.style.opacity || 0.6,
                    fillColor: feature.properties.style.fillcolor || '#000',
                    fillOpacity: feature.properties.style.fillopacity || 0.1,
                    stroke: true,
                    weight: feature.properties.style.weight || 1,
                    important: true,
                    fieldpattern: feature.properties.style.fieldpattern || null,
                    className: feature.properties.regionNames ? app.data.osom.POLYGON_CLASS_NAME : ''
                };
            } else {
                var style = {
                    dashArray: '5,5',
                    color: '#000',
                    opacity: 0.6,
                    fillColor: '#000',
                    fillOpacity: 0.1,
                    stroke: true,
                    weight: 1,
                    important: true,
                    fieldpattern: null,
                    className: feature.properties.regionNames ? app.data.osom.POLYGON_CLASS_NAME : ''
                };
            }

        try {
            try {
                // default categories from the filter rules
                if (app.data.osom.isLocalPage) {
                    feature.properties.category1 = feature.properties.category1 || 'Other';
                    categories = app.rules.majorIncident.matchRules(feature.properties.category1, feature.properties.feedType);
                } else {
                    categories = util.rules.executeMultiMatch(app.rules.osom.filters,
                        [feature.properties.feedType, feature.properties.category1, feature.properties.category2]);
                }
                categories.forEach(function(cat){
                    riskRating = (cat.priority > riskRating) ? cat.priority : riskRating;
                    style = cat.style || style;
                    iconClass = cat.iconClass || iconClass;
                    template = cat.template || template;
                });
                categoryNames = (categories && categories.length) ? categories.map(function(f){
                    return f.name;
                }) : categoryNames;

                // default styles from the style rules
                var match = null;
                if (feature.properties.feedType === 'major-incident') {
                    match = util.rules.execute(app.rules.osom.styles,
                        [feature.properties.feedType, feature.properties.category1]);
                } else {
                    match = util.rules.execute(app.rules.osom.styles,
                        [feature.properties.feedType, feature.properties.category1, feature.properties.category2, feature.properties.status]);
                }

                if (match !== null) {
                    iconClass = match.iconClass || iconClass;
                    alertClass = match.alertClass || alertClass;
                    unlisted = match.unlisted || unlisted;
                    style = match.style || style;
                    riskRating += match.priority || 0;
                    headline = match.headline || headline;
                    template = match.template || template;
                }

                // fade out pointless polygons
                if (feature.geometry) {
                    pointless = app.data.osom.isPointless(feature.geometry);
                }

                if (pointless) {
                    style = jQuery.extend({}, style);
                    if( style.important !== true ) {
                        style.fillOpacity = 0.0;
                        style.weight = 4;
                        style.dashArray = '5,5';
                    }
                } else if( feature.properties.feedType !== 'warning' ) { //non-warning pointy polygons ...
                    // ... should not be clicky clicky
                    unselectablePolygon = true;
                }

                // default specific priorities from the priority rules
                match = util.rules.execute(app.rules.osom.priorities,
                    [feature.properties.feedType, feature.properties.category1, feature.properties.category2, feature.properties.status]);
                if (match !== null) {
                    riskRating += match.priority || 0;
                }

                // classify linked incidentFeatures if present
                if (feature.properties.incidentFeatures) {
                    feature.properties.incidentFeatures.filter(function(f){
                        return f;
                    }).forEach(this.classifyFeature);
                }
                if (feature.properties.feedType === 'major-incident' && feature.properties.style) {
                    style = feature.properties.style;
                }

                if (style && style.fillPattern && style.fillPattern === 'code-red') {
                    if (!this.fillPatterns || !this.fillPatterns[style.fillPattern]) {
                        if (L.Browser.svg) {
                            this.fillPatterns[style.fillPattern] = new L.CodeRedPattern({width:20, height:20, opacity:0.5});
                            this.fillPatterns[style.fillPattern].addTo(app.map);
                        } else {
                            this.fillPatterns[style.fillPattern] = '../images/fdr-code-red.png';
                        }
                    }
                    style.fillPattern = this.fillPatterns[style.fillPattern];
                }

                // fill patterns that applies to major incident polygons only
                if (feature.properties.feedType === 'major-incident' && style.fieldpattern) {
                    //apply styles to border
                    if (style.fieldpattern == 'emsinaUnconfirmedFloodArea') {
                        style.dashArray = '5,8';
                    }
                    style.weight *= 2;
                    style.opacity = 1;

                    if (L.Browser.svg) {
                        this.pattern = new L.MajorFillPattern({
                            width: 6,
                            height: 6,
                            color: style.color,
                            majorpattern: style.fieldpattern
                        });
                        this.pattern.addTo(app.map);
                    } else {
                        this.pattern = '../images/fdr-code-red.png';
                    }
                    style.fillPattern = this.pattern;
                }

                // special mappings for specific feed types
                if (feature.properties.feedType === 'public-info') {
                    title = feature.properties.name;
                    subtitle = feature.properties.category1;
                } else if (feature.properties.feedType === 'warning') {
                    title = (headline || feature.properties.category1) + ' - ' + feature.properties.category2;
                    moreInformation = true;
                    // prepend incident reference
                    if( feature.properties.incidentList && feature.properties.incidentList.length>0 ) {
                        identifier = 'incident/' + feature.properties.incidentList[0].id + '/' + identifier;
                    }
                } else if (feature.properties.feedType === 'incident') {
                    title = feature.properties.category1;
                    if (feature.properties.category2) {
                        if (feature.properties.category2 !== 'Other') {
                            title = feature.properties.category2;
                            if (feature.properties.category2 === 'Fire Danger Rating') {
                                title = title + ' - ' + feature.properties.status;
                                sidebarTemplate = 'fdr';
                            }
                        }
                        if (feature.properties.category1 === feature.properties.category2) {
                            subtitle = feature.properties.status;
                        } else {
                            subtitle = feature.properties.category2 + ' - ' + feature.properties.status;
                        }
                    } else {
                        subtitle = feature.properties.status;
                    }
                }
            } catch (ex) {
                // caught an error during classification...
            }
        } catch (ex) {
            // caught an error during classification...
        } finally {
            feature.classification = {
                geometryType: feature.geometry ? feature.geometry.type : null,
                template: template,
                vehicles: feature.properties.resources || 0,
                pointless: pointless,
                incidentSize: feature.properties.sizeFmt || 'N/A',
                moreInformationURL: feature.properties.url || null,
                majorIncidentLink: (!app.data.osom.isLocalPage && feature.properties.majorIncidentId) ? 'respond-local/?id='+feature.properties.majorIncidentId+'#' : null,
                sidebarTemplate: sidebarTemplate,
                updatedTime: feature.properties.updated || feature.properties.created || 'Unknown',
                location: feature.properties.location || 'UNKNOWN',
                headline: headline || title,
                title: title,
                subtitle: subtitle,
                riskRating: riskRating*5,
                categories: categoryNames || ['Other'],
                style: style,
                iconClass: iconClass,
                alertClass: alertClass,
                moreInformation: moreInformation,
                deeplinkurl: '/'+identifier,
                distanceTo: null,
                unlisted: unlisted,
                unselectablePolygon: unselectablePolygon
            };
            return feature.classification;
        }
    };

    this.removePolygons = function (geom) {
        if (geom.type === 'GeometryCollection') {
            geom.geometries = geom.geometries.filter(function(g) {
                return g.type !== 'Polygon' && g.type !== 'MultiPolygon';
            }).map(app.data.osom.removePolygons);
        }
        return geom;
    };

    this.dataFilter = function (f) {
        if (f.properties.feedType === 'public-info') {
            return f.properties.category1 === 'Response';
        }

        //filters out state view data for p+gr local view
        if (app.data.osom.isLocalPage) {
            if (app.major.major.whichPage() === 'Prepare') {
                return f.properties.feedType === 'major-incident';
            }
        }

        //else if (f.properties.feedType === 'incident' && f.properties.category1 === 'Met') { //ie browsers
        //    if( L.Browser.ie ) {
        //        f.geometry = app.data.osom.removePolygons(f.geometry);
        //    }
        //}
        return true;
    };

    this.featureSort = function (a,b) {
        // sort the features based on riskRating
        var ac = app.data.osom.classifyFeature(a);
        var bc = app.data.osom.classifyFeature(b);
        if (ac.riskRating === bc.riskRating) {
            return 0;
        }
        return (ac.riskRating < bc.riskRating) ? -1 : 1;
    };

    this.postprocessFeatures = function (features) {
        var incidentMap = {};
        features.map(function(f){
            if ((f.properties.feedType === 'incident') && f.properties.id) {
                incidentMap[f.properties.id] = f;
            }
        });

        features.map(function(f){
            if ((f.properties.feedType === 'warning') && f.properties.incidentList) {
                var il = f.properties.incidentList.map(function(il){
                    return incidentMap[il.id];
                }).filter(function(f){
                    return f;
                });
                if (il && il.length) {
                    f.properties.incidentFeatures = il;
                }
            }
        });
    };

    this.countTotal = function (data, controller) {
        //clean the share cluster layer
        controller.totalOthers = 0;
        controller.totalWarnings = 0
        for (var i = 0; i < data.features.length; i++) {
            var feature = data.features[i];
            if (feature.properties.feedType === 'warning') {
                controller.totalWarnings++;
            } else if (feature.properties && (feature.properties.feedType === 'incident' || feature.properties.feedType === 'major-incident' || feature.properties.feedType === 'earthquake')) {
                controller.totalOthers++;
            }
        }
    }

    this.afterUpdateMapElements = function () {
        var polygon = {};
        return;

        $('.' + app.data.osom.POLYGON_CLASS_NAME).each(function (f) {
            var g = this//$(this).parent();
            var rect = g.getBoundingClientRect();
            var id = rect.top + ':' + rect.left + ' ' + rect.bottom + ':' + rect.right + '|' + (rect.right - rect.left) + 'x' + (rect.bottom - rect.top);
            if (!polygon[id]) {
                polygon[id] = []
            }
            if (L.Browser.svg) {
                polygon[id].push($(this).parent())
            }
            else {
                polygon[id].push($(this))
            }
        });

        for (var p in polygon) {
            var current = polygon[p];

            if (current.length > 1) {
                for (var i = 1; i < current.length; i++) {
                    if (L.Browser.svg) {
                        $(current[i]).find('path').css('fill-opacity', 0)
                    }
                    else {
                        try{
                            $(current[i]).remove();
                        }
                        catch (err) {

                        }
                    }
                }
            } else {
                if (L.Browser.svg) {
                    $(current[0]).find('path').css('fill-opacity', 0.1)
                }
                else {
                    //$(current[0]).remove();
                }
            }
        }
    }
    console.log(app.data.clusterLayer);

<<<<<<< HEAD
    this.redirectToState = function () {
        app.ui.alert.error('This major incident page does not exist anymore. You will be redirected back to the main page in 5 seconds');
        var url = app.major.major.rename(app.major.major.whichPage());
        setTimeout(function() {
            window.location = '/'+url;
        }, 5000);
    }

    this.initExtendedData = function (data) {
        app.major.major.init(data);
    }
    this.updateDisplayLayers = function (layers) {
        return;
        var list = app.data.filters.filter(function (f) {
            return f.visible && !f.removed;
        });
        var visibleLayer = list.length > 0 ? list[0] : null;

        for (var i = 0; i < app.data.filters.length; i++) {
            var list = layers.filter(function (f) {
                return app.data.filters[i].name === f.name;
            });

            if (visibleLayer === null) {
                app.data.filters[i].visible = list.length > 0 && list[0].status == 'on' ? true : false;
=======
    app.data.controllers.push(new app.data.controller.geojson({
        filters: app.rules.osom.filters,
        dataFilter: this.dataFilter,
        featureSort: this.featureSort,
        shareClusterLayer: app.data.clusterLayer,
        layerGroupName:'osome-geojson',
        fastPollUrl: function() {
            if( util.feature.toggles.qadata ) {
                return '/remote/data/osom-delta.json'+'?'+Date.now();
            } else if( util.feature.toggles.testdata ) {
                return 'data/osom-delta.json'+'?'+Date.now();
            } else { // live data
                return '/public/osom-delta.json'+'?'+Date.now();
>>>>>>> 94d42be305d0ee79f7c4e5dd37375f066cd068ab
            }
            app.data.filters[i].removed = list.length > 0 ? false : true;
            app.data.filters[i].nocache = true;
        }
    };

    this.buildDynamicFilters = function (data, controller) {
        if (data.incidentInfo && data.incidentInfo.incidentStage && data.incidentInfo.incidentStage !== app.major.major.whichPage()) {
            data.geoJson.features=[];
            return data;
        }
        var geojson = data.geoJson;
        var dynamicFilters = [];
        geojson.features.map(function (f) {
            var prop = f.properties;
            prop.category1 = prop.category1 || 'Others';
            var rules = [[]];
            var matches = app.rules.majorIncident.filters.filter(function (f) {
                if(prop.feedType == 'warning' && f.name=='Warnings') {
                    return true;
                }
                if (prop.category1 === 'Other' && prop.category2 === 'Other') {
                    return false;
                }

                var rulescount = f.rules.filter(function (r) {
                    return $.inArray(prop.category1, r) > -1;
                });
                return rulescount.length > 0;
            });

            rules[0].push(prop.category1)
            if (matches.length == 0) {
                matches.push(
                    {
                        name: 'Other',
                        rules: rules,
                        priority: 100,
                        visible: true,
                    }
                )
            }
<<<<<<< HEAD

            matches.map(function (m) {
                var list= dynamicFilters.filter(function (item) {
                    return item.name == m.name;
                });

                if (list.length == 0) {
                    if (m.name === 'Warnings') {
                        m.aaa = true;
                    }
                    dynamicFilters.push(m);
                    app.data.ensureFilter(m);
                }
                if(m.name !=='Warnings') {
                    //add current filter
                    var currentFilter = {
                        name: prop.category1,
                        displayName: prop.category1,
                        visible: true,
                        rules: rules,
                        parent: list.length == 0 ? m : list[0]
                    };

                    var list = dynamicFilters.filter(function (f) {
                        return f.name === currentFilter.name;
                    })
                    if (list.length == 0) {
                        dynamicFilters.push(currentFilter);
                        app.data.ensureFilter(currentFilter);
                    }
                }
            })
        })

        var displayableLayers = data.layers;
        app.data.osom.currentFilters = dynamicFilters;
        app.data.osom.currentLayers = displayableLayers;
        controller.updateFilters(dynamicFilters);
        app.rules.majorDynamicLayer.buildDynamicLayers(displayableLayers);
        app.ui.filter.rerender(displayableLayers);
        return data;
    }

    this.pushLocalController = function() {
        app.data.controllers.push(new app.data.controller.geojson({
            primaryInteractionLayer: true, // determines deeplinking, refreshing spinner, etc
            filters: [],
            errorMessage: 'No major incident data available for this warning',
            majorDataFailed: this.redirectToState,
            dataFilter: this.dataFilter,
            featureSort: this.featureSort,
            shareClusterLayer: app.data.getShareClusterLayer(),
            clusterName:'localview',
            /*fastPollUrl: function() {
                if( util.feature.toggles.qadata ) {
                    return '/remote/data/osom-delta.json'+'?'+Date.now();
                } else if( util.feature.toggles.testdata ) {
                    return 'data/osom-delta.json'+'?'+Date.now();
                } else { // live data
                    return '/public/osom-delta.json'+'?'+Date.now();
                }
            },*/
            url: function () {
                var id = util.url.getParameterByName('id');
                /*if( util.feature.toggles.qadata ) {
                    return '/remote/data/osom-geojson.json';
                } else if( util.feature.toggles.testdata ) {
                    return 'data/osom-geojson.json';
                } else { // live data*/
                if (id) {
                    if (/sean/.test(id)) {
                        return 'data/major/'+id+'.json';
                    } else {
                        return 'data/local-view/'+id+'.json';
                    }
                }
            },
            classifyFeature: this.classifyFeature,
            postprocessFeatures: this.postprocessFeatures,
            featureCounter: this.countTotal,
            extendDataProcess: this.initExtendedData,
            buildDynamicFilters: this.buildDynamicFilters
        }));
    }

    this.pushStateController = function () {
        app.data.filters = app.data.filters.concat(app.rules.osom.filters);
        app.ui.filter.initDropdown()
        app.ui.filter.restoreFilterFromCookies();

        app.data.controllers.push(new app.data.controller.geojson({
            primaryInteractionLayer: true, // determines deeplinking, refreshing spinner, etc
            filters: app.rules.osom.filters,
            dataFilter: this.dataFilter,
            featureSort: this.featureSort,
            fastPollUrl: function() {
                if( util.feature.toggles.qadata ) {
                    return '/remote/data/osom-delta.json'+'?'+Date.now();
                } else if( util.feature.toggles.testdata ) {
                    return 'data/osom-delta.json'+'?'+Date.now();
                } else { // live data
                    return '/public/osom-delta.json'+'?'+Date.now();
                }
            },
            url: function() {
                if( util.feature.toggles.qadata ) {
                    return '/remote/data/osom-geojson.json';
                } else if( util.feature.toggles.testdata ) {
                    return 'data/osom-geojson.json';
                } else { // live data
                    return '/public/osom-geojson.json';
                }
            },
            classifyFeature: this.classifyFeature,
            postprocessFeatures: this.postprocessFeatures,
            featureCounter: this.countTotal,
            afterUpdateMapElements: this.afterUpdateMapElements
        }));
    }
=======
        },
        classifyFeature: this.classifyFeature,
        postprocessFeatures: this.postprocessFeatures,
        beforeProcessData  : this.countTotal
    }));
    //add test data
    app.data.controllers.push(new app.data.controller.geojson({
        filters: app.rules.osom.filters,
        dataFilter: this.dataFilter,
        featureSort: this.featureSort,
        shareClusterLayer: app.data.clusterLayer,
        layerGroupName: 'osome-geojson-testdata',
        url: 'data/osom-geojson.json',
        classifyFeature: this.classifyFeature,
        postprocessFeatures: this.postprocessFeatures,
        beforeProcessData: this.countTotal
    }));

>>>>>>> 94d42be305d0ee79f7c4e5dd37375f066cd068ab

}).apply(app.data.osom);
