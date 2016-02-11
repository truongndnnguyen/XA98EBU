'use strict';

/* globals app: false */
/* globals util: false */
/* jshint unused:false */

app.data.reliefRecovery = app.data.reliefRecovery || {};
(function () {

    app.data.filters = app.data.filters.concat(app.rules.osom.filters);

    //This will be removed once card 507 is completed
    /*this.classifyFeature = function (feature) {
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
            sidebarTemplate = 'osom-' + feature.properties.feedType,
            title = feature.properties.category1 || 'Unknown',
            subtitle = feature.properties.name || feature.properties.category2 || '',
            moreInformation = (feature.properties.url || feature.properties.webBody) ? true : false,
            identifier = feature.properties.feedType + '/' + feature.properties.id,
            categories = [],
            categoryNames = ['Other'],
            riskRating = 0,
            style = {
                dashArray: '10,10',
                color: '#0634FE',
                fill:false,
                opacity: 1,
                fillColor: '#000',
                fillOpacity: 0.1,
                stroke: true,
                weight: 3,
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
                categories.forEach(function (cat) {
                    riskRating = (cat.priority > riskRating) ? cat.priority : riskRating;
                    style = cat.style || style;
                    iconClass = cat.iconClass || iconClass;
                    template = cat.template || template;
                });
                categoryNames = (categories && categories.length) ? categories.map(function (f) {
                    return f.name;
                }) : categoryNames;

                // default styles from the style rules
                var match = util.rules.execute(app.rules.osom.styles,
                    [feature.properties.feedType, feature.properties.category1, feature.properties.category2, feature.properties.status]);
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
                    pointless = app.data.reliefRecovery.isPointless(feature.geometry);
                }

                if (pointless) {
                    style = jQuery.extend({}, style);
                    if (style.important !== true) {
                        style.fillOpacity = 0.0;
                        style.weight = 4;
                        style.dashArray = '5,5';
                    }
                } else if (feature.properties.feedType !== 'warning') { //non-warning pointy polygons ...
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
                    feature.properties.incidentFeatures.filter(function (f) {
                        return f;
                    }).forEach(this.classifyFeature);
                }

                if (feature.properties.style) {
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
                    if (feature.properties.incidentList && feature.properties.incidentList.length > 0) {
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
        } finally {
            feature.classification = {
                geometryType: feature.geometry ? feature.geometry.type : null,
                template: template,
                vehicles: feature.properties.resources || 0,
                pointless: pointless,
                incidentSize: feature.properties.sizeFmt || 'N/A',
                moreInformationURL: './relief-local?id=' + feature.properties.id,
                sidebarTemplate: sidebarTemplate,
                updatedTime: feature.properties.updated || feature.properties.created || 'Unknown',
                location: feature.properties.location || 'UNKNOWN',
                headline: headline || title,
                title: title,
                subtitle: subtitle,
                riskRating: riskRating * 5,
                categories: categoryNames || ['Other'],
                style: style,
                iconClass: iconClass,
                alertClass: alertClass,
                moreInformation: moreInformation,
                deeplinkurl: '/' + identifier,
                distanceTo: null,
                unlisted: unlisted,
                unselectablePolygon: unselectablePolygon
            };
            return feature.classification;
        }
    };*/

    this.classifyFeature = function(feature) {
        //overwrite existing classification which applies only to recovery
        var cls = app.data.osom.classifyFeature(feature);
        cls.sidebarTemplate = 'osom-incident';
        if (!app.data.osom.isLocalPage) {
            cls.moreInformation = (feature.properties.url || feature.properties.webBody || feature.properties.publicroomid) ? true : false;
        }
        cls.majorIncidentLink = (!app.data.osom.isLocalPage && feature.properties.publicroomid) ? 'relief-local/?id='+feature.properties.publicroomid+'#' : null;
        return cls;
    }

    this.dataFilter = function (f) {
        //needs to be changed once categories are updated
        if (f.properties.feedType === 'public-info') {
            return f.properties.category1 === 'Recovery';
        }
        return true;
    };

    this.featureSort = function (a, b) {
        // sort the features based on riskRating
        var ac = app.data.reliefRecovery.classifyFeature(a);
        var bc = app.data.reliefRecovery.classifyFeature(b);
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

    this.countTotal = function (data,controller) {
        controller.totalOthers = data.features.length;
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
            url: function () {
                if (util.feature.toggles.qadata) {
                    return '/remote/data/osom-relief-recovery.json';
                } else if (util.feature.toggles.testdata) {
                    return 'data/osom-relief-recovery.json';
                } else { // live data
                    return 'public/osom-relief-recovery.json';
                }
            },
            classifyFeature: this.classifyFeature,
            postprocessFeatures: this.postprocessFeatures,
            featureCounter: this.countTotal,
            afterUpdateMapElements: this.afterUpdateMapElements
        }));
    }

}).apply(app.data.reliefRecovery);
