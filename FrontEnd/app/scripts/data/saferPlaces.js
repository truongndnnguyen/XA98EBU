'use strict';

/* globals app: false */

app.data.saferPlaces = app.data.saferPlaces || {};

(function() {

    this.filters = [{
        name: 'Safer Places',
        rules: 'safer-place'
    }];
    app.data.filters = this.filters.concat(app.data.filters);

    this.classifyFeature = function(feature) {
        if (feature.classification) {
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'other';
        var iconClass = 'safer-place',
            title = feature.properties.location,
            subtitle = '',
            style = {};
        feature.classification = {
            title: title,
            style: style,
            subtitle: subtitle,
            location: feature.properties.incidentLocation || 'Unknown',
            template: 'other',
            sidebarTemplate: 'other',
            categories: ['Safer Places'],
            iconClass: iconClass,
            moreInformation: false,
            geometryType: feature.geometry.type,
            deeplinkurl: '/'+feature.properties.feedType+'/'+feature.id
        };
        return feature.classification;
    };

    app.data.controllers.push(new app.data.controller.geojson({
        filters: this.filters,
        url: 'data/saferPlace.json',
        classifyFeature: this.classifyFeature
    }));

}).apply(app.data.saferPlaces);
