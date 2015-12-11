'use strict';

/* globals app: false */

app.data.fdr = app.data.fdr || {};

(function() {

    this.filters = [{
        thematicLayer: true,
        thematicFeatures: true,
        defaultHidden: true,
        name: 'Fire Danger Ratings',
        rules: 'fire-danger-rating'
    }];
    app.data.filters = app.data.filters.concat(this.filters);

    this.classifyFeature = function(feature) {
        if (feature.classification) {
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'other';
        var iconClass = 'fire-danger-rating',
            title = feature.properties.status + ' Fire Danger Rating',
            subtitle = feature.properties.location,
            style = {
                className : 'fdr fdr-' + feature.properties.status.toLowerCase().replace(/\s/g, '-')
            };
        feature.classification = {
            headline: title,
            riskRating: 100000,
            markerHTML: '<div class="marker-fdr marker-fdr-' + feature.properties.status.toLowerCase().replace(/\s/g, '-')  + '">' + feature.properties.status + '<br/>' + feature.properties.location + '</div>',
            title: title,
            style: style,
            subtitle: subtitle,
            incidentSize: 'N/A',
            updatedTime: feature.properties.updated || feature.properties.created || 'Unknown',
            location: feature.properties.location || 'Unknown',
            template: 'incident',
            sidebarTemplate: 'incident',
            categories: ['Fire Danger Ratings'],
            iconClass: iconClass,
            moreInformation: true,
            moreInformationURL: feature.properties.url,
            geometryType: feature.geometry.type,
            deeplinkurl: '/' + feature.properties.feedType + '/' + feature.properties.id,
            isFireDangerRating : true
        };
        return feature.classification;
    };

    app.data.controllers.push(new app.data.controller.geojson({
        filters: this.filters,
        url: function() {
            if( util.feature.toggles.qadata ) {
                return '/remote/data/osom-fdr.json';
            } else if( util.feature.toggles.testdata ) {
                return 'data/osom-fdr.json';
            } else { // live data
                return '/public/osom-fdr.json';
            }
        },
        classifyFeature: this.classifyFeature
    }));

}).apply(app.data.fdr);
