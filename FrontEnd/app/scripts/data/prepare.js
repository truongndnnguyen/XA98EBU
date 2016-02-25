'use strict';

/* globals app: false */

app.data.prepare = app.data.prepare || {};

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
        layerGroup: 'Fire',
        order:100,
        name: 'Fire Danger Rating Today',
        displayName:'Fire Danger Ratings',
        rules: 'fire-danger-rating-today',
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for four days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.'
    },
    {
        thematicLayer: true,
        thematicFeatures: true,
        defaultHidden: true,
        layerGroup: 'Fire',
        hide: true,
        order: 99,
        name: 'Fire Danger Rating Tomorrow',
        displayName:'Fire Danger Ratings',
        rules: 'fire-danger-rating-tomorrow',
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for four days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.'
    },
    {
        thematicLayer: true,
        thematicFeatures: true,
        defaultHidden: true,
        layerGroup: 'Fire',
        displayName: 'Fire Danger Ratings',
        order: 98,
        hide: true,
        name: 'Fire Danger Rating next 2 days',
        rules: 'fire-danger-rating-2days',
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for four days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.'
    },
    {
        thematicLayer: true,
        thematicFeatures: true,
        defaultHidden: true,
        layerGroup: 'Fire',
        displayName: 'Fire Danger Ratings',
        order: 97,
        hide:true,
        name: 'Fire Danger Rating next 3 days',
        rules: 'fire-danger-rating-3days',
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for four days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.'
    },
    {
        thematicLayer: true,
        thematicFeatures: true,
        defaultHidden: true,
        layerGroup: 'Fire',
        hide:true,
        name: 'Fire Danger Rating next 4 days',
        rules: 'fire-danger-rating-4days',
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for four days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.'
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
                fillColor: app.data.prepare.riskRatingColors[feature.properties.status],
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
        var categories = [];
        categories.push(feature.properties.category2);
        feature.classification = {
            headline: title,
            riskRating: 100000,
            title: title,
            style: style,
            subtitle: subtitle,
            incidentSize: 'N/A',
            updatedTime: feature.properties.updated || feature.properties.created || 'Unknown',
            location: feature.properties.location || 'Unknown',
            template: 'fdr',
            sidebarTemplate: 'incident',
            categories: categories,//['Fire Danger Ratings'],
            iconClass: iconClass,
            moreInformation: true,
            moreInformationURL: feature.properties.url,
            geometryType: feature.geometry.type,
            deeplinkurl: '/' + feature.properties.feedType + '/' + feature.properties.id,
            isFireDangerRating : true
        };
        return feature.classification;
    };
    this.dataFilter = function(f) {
        //TODO - other rules to filter data here.
        if(f.properties.category1 && f.properties.category2) {
            return true;
        }
        return false;
    }
    app.data.controllers.push(new app.data.controller.geojson({
        primaryInteractionLayer: false, // determines deeplinking, refreshing spinner, etc
        loadOnDemand: true, // only load the data if the layer is active/visible
        filters: this.filters,
        dataFilter : this.dataFilter,
        url: function() {
            if( util.feature.toggles.qadata ) {
                return '/remote/data/osom-pgr.json';
            } else if( util.feature.toggles.testdata ) {
                return 'data/osom-pgr.json';
            } else { // live data
                return '/public/osom-pgr.json';
            }
        },
        classifyFeature: this.classifyFeature,
    }));

}).apply(app.data.prepare);
