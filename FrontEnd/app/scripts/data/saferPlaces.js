'use strict';

/* globals app: false */

app.data.saferPlaces = app.data.saferPlaces || {};

(function() {

    this.filters = [{
        name: 'Neighbourhood safer places',
        rules: 'safer-place',
        thematicLayer: true,
        thematicFeatures: true,
        layerGroup: 'Being Prepare',
        defaultHidden: true,
    }];
    app.data.filters = this.filters.concat(app.data.filters);

    this.classifyFeature = function(feature) {
        if (feature.classification) {
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'other';
        var iconClass = 'safer-place',
            title = feature.properties.type,
            subtitle = '',
            style = {};
        feature.classification = {
            title: title,
            style: style,
            subtitle: subtitle,
            location: feature.properties.location || 'Unknown',
            template: 'safe-place',
            sidebarTemplate: 'other',
            categories: ['Neighbourhood safer places'],
            iconClass: iconClass,
            moreInformation: true,
            moreInformationURL: feature.properties.link,
            geometryType: feature.geometry.type,
            deeplinkurl: '/'+feature.properties.feedType+'/'+feature.id
        };
        return feature.classification;
    };

    app.data.controllers.push(new app.data.controller.geojson({
        filters: this.filters,
        primaryInteractionLayer: false,
        loadOnDemand: true,
        url: function() {
            if( util.feature.toggles.qadata ) {
                return '/remote/data/saferPlace.json';
            } else if( util.feature.toggles.testdata ) {
                return 'data/saferPlace.json';
            } else { // live data
                return '/data/saferPlace.json';
            }
        },
        classifyFeature: this.classifyFeature
    }));

}).apply(app.data.saferPlaces);
