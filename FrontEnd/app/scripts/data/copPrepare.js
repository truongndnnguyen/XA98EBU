'use strict';

/* globals app: false */
/* globals util: false */

app.data.copPrepare = app.data.copPrepare || {};

(function() {

    this.filters = [{
        name: 'Preparation Campaigns',
        rules: [['copPrepare:public-info']]
    }];
    app.data.filters = this.filters.concat(app.data.filters);

    this.classifyFeature = function(feature) {
        if (feature.classification) {
            return feature.classification;
        }
        feature.properties.feedType = feature.properties.feedType || 'other';
        var iconClass = 'other',
            title = 'Unknown',
            subtitle = '',
            category = null,
            style = {};
        if (feature.properties.feedType === 'public-info') {
            title = feature.properties.name;
            subtitle = feature.properties.category1;
            iconClass = 'public-info';
            style = {
                color: '#0000FF',
                opacity: 1.0,
                fillColor: '#0000ff',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            };
            category = util.rules.execute(app.data.filters,['copPrepare:'+feature.properties.feedType]);
        } else {
            category = util.rules.execute(app.data.filters,[]);
        }
        feature.classification = {
            title: title,
            style: style,
            subtitle: subtitle,
            location: feature.properties.location || 'Unknown',
            template: feature.properties.feedType,
            sidebarTemplate: 'other',
            categories: [category?category.name:'Other'],
            iconClass: iconClass,
            geometryType: feature.geometry.type,
            moreInformation: true,
            moreInformationURL: feature.properties.url,
            deeplinkurl: '/'+feature.properties.feedType+'/'+feature.properties.id
        };
        return feature.classification;
    };

    this.dataFilter = function(f) {
        return (f.properties.feedType === 'public-info') &&
            (f.properties.category1 === 'Prepare');
    };

    app.data.controllers.push(new app.data.controller.geojson({
        dataFilter: this.dataFilter,
        filters: this.filters,
        url: '../data/osom-geojson.json',
        // url: 'http://public-info.ci.devcop.em.vic.gov.au/public/osom-geojson.json',
        classifyFeature: this.classifyFeature
    }));

}).apply(app.data.copPrepare);
