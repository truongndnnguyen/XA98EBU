'use strict';

/* globals app: false */
/* globals util: false */
/* jshint unused:false */

app.data.osom = app.data.osom || {};
(function() {

    app.data.filters = app.data.filters.concat(app.rules.osom.filters);

    this.isPointless = function(geometry) {
        if( geometry.type === 'GeometryCollection' ) {
            return geometry.geometries.filter(function(geom){
                return !app.data.osom.isPointless(geom);
            }).length === 0;
        } else {
            return (geometry.type !== 'Point') && (geometry.type !== 'MultiPoint');
        }
    };

    this.classifyFeature = function(feature) {
        if (feature.classification) {
            return feature.classification;
        }
        if( !feature.properties || !feature.properties.feedType ) {
            feature.classification = {};
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'other';
        feature.properties.id = feature.properties.id || feature.properties.created;

        var iconClass = feature.properties.cssClass || 'other',
            alertClass = feature.properties.alertClass || null,
            title = feature.properties.category1 || 'Unknown',
            subtitle = feature.properties.name || feature.properties.category2 || '',
            moreInformation = (feature.properties.url || feature.properties.webBody) ? true : false,
            identifier = feature.properties.feedType+'/'+feature.properties.id,
            categories = [],
            categoryNames = ['Other'],
            riskRating = 0,
            style = {
                dashArray: '5,5',
                color: '#000',
                opacity: 0.6,
                fillColor: '#000',
                fillOpacity: 0.1,
                stroke: true,
                weight: 1,
                important: true
            },
            headline = null,
            unlisted = false,
            pointless = false,
            unselectablePolygon = false;
        try {
            try {
                // default categories from the filter rules
                categories = util.rules.executeMultiMatch(app.rules.osom.filters,
                    [feature.properties.feedType, feature.properties.category1, feature.properties.category2]);
                categories.forEach(function(cat){
                    riskRating = (cat.priority > riskRating) ? cat.priority : riskRating;
                    style = cat.style || style;
                    iconClass = cat.iconClass || iconClass;
                });
                categoryNames = (categories && categories.length) ? categories.map(function(f){
                    return f.name;
                }) : categoryNames;

                // default styles from the style rules
                var match = util.rules.execute(app.rules.osom.styles,
                    [feature.properties.feedType, feature.properties.category1, feature.properties.category2, feature.properties.status]);
                if( match !== null ) {
                    iconClass = match.iconClass || iconClass;
                    alertClass = match.alertClass || alertClass;
                    unlisted = match.unlisted || unlisted;
                    style = match.style || style;
                    riskRating += match.priority || 0;
                    headline = match.headline || headline;
                }

                // fade out pointless polygons
                if( feature.geometry ) {
                    pointless = app.data.osom.isPointless(feature.geometry);
                }

                if( pointless ) {
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
                if( match !== null ) {
                    riskRating += match.priority || 0;
                }

                // classify linked incidentFeatures if present
                if( feature.properties.incidentFeatures ) {
                    feature.properties.incidentFeatures.filter(function(f){
                        return f;
                    }).forEach(this.classifyFeature);
                }

                if( feature.properties.style ) {
                    style = feature.properties.style;
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
                        if( feature.properties.category2 !== 'Other' ) {
                            title = feature.properties.category2;
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
            } catch( ex ) {
                // caught an error during classification...
                //console.log('error!!!: '+ex);
            }
        } catch( ex ) {
            // caught an error during classification
            //console.log('error!!!: '+ex);
        } finally {
            feature.classification = {
                geometryType: feature.geometry ? feature.geometry.type : null,
                template: feature.properties.feedType,
                vehicles: feature.properties.resources || 0,
                pointless: pointless,
                incidentSize: feature.properties.sizeFmt || 'N/A',
                moreInformationURL: feature.properties.url || null,
                sidebarTemplate: 'osom-'+feature.properties.feedType,
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

    this.dataFilter = function(f) {
        if (f.properties.feedType === 'public-info') {
            return f.properties.category1 === 'Response';
        }
        return true;
    };

    this.featureSort = function(a,b) {
        // sort the features based on riskRating
        var ac = app.data.osom.classifyFeature(a);
        var bc = app.data.osom.classifyFeature(b);
        if( ac.riskRating === bc.riskRating ) {
            return 0;
        }
        return (ac.riskRating < bc.riskRating) ? -1 : 1;
    };

    this.postprocessFeatures = function(features) {
        var incidentMap = {};
        features.map(function(f){
            if( (f.properties.feedType === 'incident') && f.properties.id ) {
                incidentMap[f.properties.id] = f;
            }
        });

        features.map(function(f){
            if( (f.properties.feedType === 'warning') && f.properties.incidentList ) {
                var il = f.properties.incidentList.map(function(il){
                    return incidentMap[il.id];
                }).filter(function(f){
                    return f;
                });
                if( il && il.length ) {
                    f.properties.incidentFeatures = il;
                }
            }
        });
    };

    app.data.controllers.push(new app.data.controller.geojson({
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
        postprocessFeatures: this.postprocessFeatures
    }));

}).apply(app.data.osom);
