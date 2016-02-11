'use strict';

/* globals app: false */

app.data.fdr = app.data.fdr || {};

(function() {

    this.pattern = null;
    this.riskRatingColors = {
        'HIGH': '#00ACED',
        'VERY HIGH': '#FDED00',
        'LOW-MODERATE': '#78BF41',
        'SEVERE': '#F69527',
        'EXTREME': '#EE2D24',
        'CODE RED': '#FF0000'
    };

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
            title = 'Fire Danger Rating',
            subtitle = feature.properties.location,
            ratingCode = feature.properties.status.toLowerCase().replace(/\s/g, '-'),
            style = {
                className: 'fdr fdr-' + ratingCode,
                fill: true,
                fillOpacity: 1.0,
                fillColor: app.data.fdr.riskRatingColors[feature.properties.status],
                opacity: 1.0,
                color: 'black',
                color2: 'black',
                stroke: 1,
                stroked: false,
                strokeweight: 1,
                weight: 2
            };

        if( ratingCode === 'code-red' ) {
            if( !this.pattern ) {
                if( L.Browser.svg ) {
                    this.pattern = new L.CodeRedPattern({width:20, height:20});
                    this.pattern.addTo(app.map);
                } else {
                    this.pattern = '../images/fdr-code-red.png';
                }
            }
            style.fillPattern = this.pattern;
        }

        feature.classification = {
            headline: title,
            riskRating: 100000,
            xmarkerHTML: '<div class="marker-fdr marker-fdr-' + ratingCode  + '">' + feature.properties.status + '<br/>' + feature.properties.location + '</div>',
            title: title,
            style: style,
            subtitle: subtitle,
            incidentSize: 'N/A',
            updatedTime: feature.properties.updated || feature.properties.created || 'Unknown',
            location: feature.properties.location || 'Unknown',
            template: 'fdr',
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
        primaryInteractionLayer: false, // determines deeplinking, refreshing spinner, etc
        loadOnDemand: true, // only load the data if the layer is active/visible
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
        classifyFeature: this.classifyFeature,
    }));

}).apply(app.data.fdr);
