'use strict';

var app = app||{};
app.rules = app.rules || {};
app.rules.majorDynamicLayer = app.rules.majorDynamicLayer || {};

(function() {

    this.filters = [
    ];
    this.vicroadFilters = [
        {
            thematicLayer: true,
            defaultHidden: true,
            multiple: true,
            visible: true,
            geojsonLayer: true,
            name: 'Vicroads - Road Closed',
            rules: ['road-closed'],
        },
        {
            thematicLayer: true,
            defaultHidden: true,
            multiple: true,
            visible: true,
            geojsonLayer: true,
            name: 'Vicroads - Road Works',
            rules: ['road-works'],
        }
    ]
    this.hasVicroadController = false;
    this.getUrl = function (url) {
        return url.replace('http://public-info.ci.devcop.em.vic.gov.au','');
    }
    this.buildDynamicLayers = function (layers) {
        if (layers) {
            layers.filter(function (p) {
                return p.datasourcetype == 'wms'
            }).map(function (l) {
                var layers = [];
                layers.push({ layers: l.layerName })
                var filter = {
                    thematicLayer: true,
                    multiple: true,
                    isDefaultedOn:l.isDefaultedOn,
                    defaultHidden: !l.isDefaultedOn,
                    visible: l.isDefaultedOn,
                    nocache : true,
                    wmsLayerConf: layers,
                    name: l.displayName,
                    wmsLayerURL: l.internalUrl
                }

                app.rules.majorDynamicLayer.filters.push(filter);
            })

            layers.filter(function (p) {
                return p.datasourcetype == 'geojson'
            }).map(function (l) {
                if (l.displayName == 'Vicroads Road Closures') {
                    app.rules.majorDynamicLayer.vicroadFilters.map(function (f) {
                        f.visible = l.isDefaultedOn;
                        f.isDefaultedOn = l.isDefaultedOn;
                    });
                }

                if (!app.rules.majorDynamicLayer.hasVicroadController) {
                    app.data.filters = app.data.filters.concat(app.rules.majorDynamicLayer.vicroadFilters);
                    app.rules.majorDynamicLayer.hasVicroadController = true;

                    app.data.controllers.push(new app.data.controller.geojson({
                        primaryInteractionLayer: true,
                        filters: app.rules.majorDynamicLayer.vicroadFilters,
                        errorMessage: 'No vicroad data found.',
                        shareClusterLayer: app.data.getShareClusterLayer(),
                        clusterName:'vicroads',
                        //featureSort: this.featureSort,
                        url: app.rules.majorDynamicLayer.getUrl(l.internalUrl),
                        classifyFeature: app.rules.majorDynamicLayer.classifyFeature,
                        featureCounter: function (data, controller) {
                            if (data.features) {
                                controller.totalOthers = data.features.length;
                            }
                        }
                    }));
                    app.ui.filter.rerender();
                    //need better way to reload data.
                    app.data.refresh();
                }
                else {
                    //app.data.refresh();
                }
            })
        }
        this.ensureUpdateDataLayer();
    }

    this.classifyFeature = function (feature) {
        if (feature.classification) {
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'vicroads';
        feature.properties.id = feature.properties.id || feature.properties.created;

        var vicroadsCategory = app.rules.majorDynamicLayer.vicroadFilters.filter(function (f) {
            return $.inArray(feature.properties.type, f.rules) > -1;
        }).map(function (f) {
            return f.name;
        });
        var iconClass = feature.properties.type || 'other',
            alertClass = feature.properties.alertClass || null,
            template = 'vicroads',
            sidebarTemplate = 'osom-incident',
            title = feature.properties.title,
            subtitle = '',
            moreInformation = (feature.properties.url || feature.properties.webBody) ? true : false,
            identifier = feature.properties.feedType + '/' + feature.properties.id,
            categories = [],
            categoryNames = vicroadsCategory || ['Other'],
            riskRating = 89,
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
            unselectablePolygon = false,
            startLabel = 'Started',
            endLabel = 'Updated at';
        try {
            try {
                //TODO : implement any styles requirement
                if (feature.properties.style) {
                    style = feature.properties.style;
                }

                var timeDiff = moment(feature.properties.endDate).diff(new Date(), 'minutes');
                if (timeDiff > 0) {
                    startLabel = 'Start';
                    endLabel = 'End';
                }

            } catch (ex) {
                // caught an error during classification...
            }
        } catch (ex) {
        } finally {
            feature.classification = {
                startLabel: startLabel,
                endLabel: endLabel,
                geometryType: feature.geometry ? feature.geometry.type : null,
                template: template,
                vehicles: feature.properties.resources || 0,
                pointless: pointless,
                incidentSize: feature.properties.sizeFmt || 'N/A',
                moreInformationURL: feature.properties.url || null,
                sidebarTemplate: sidebarTemplate,
                updatedTime: feature.properties.startDate|| 'Unknown',
                location: feature.properties.location || '',
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
    };

    this.ensureUpdateDataLayer = function () {
        this.filters.map(function (f) {
            var list = app.data.filters.filter(function (f1) {
                return f1.thematicLayer && f1.name === f.name;
            });
            if (list.length == 0) {
                app.data.filters.push(f);
            }
        });
        app.data.majorDynamicLayer.initLayers();
    }

}).apply(app.rules.majorDynamicLayer);
