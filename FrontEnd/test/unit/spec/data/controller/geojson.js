(function() {
  'use strict';

  describe("EM-Public Data Controller GeoJSON", function() {

    var otherFeature, simpleFeature, fullFeature, fullFilters, geometryCollectionFeature;
    var appUiSelectFeatureStub;

    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        simpleFeature = {
            geometry: {
                'type': 'Point'
            },
            properties: {
                feedType: 'safer-place',
                incidentstage: 'Relief'
            }
        };

        fullFeature = {
            features: [{
                "type":"Feature",
                properties: {
                    feedType: 'safer-place',
                    incidentstage: 'Relief'
                },
                geometry:{
                    "type":"Point",
                    coordinates:[142.932, -37.284]
                },
                classification:{
                    categories: ['Safer Places'],
                    deeplinkurl: 'safer-place/123'
                }
            }]
        };

        geometryCollectionFeature = {
                "type": "Feature",
                "geometry": {
                    "type": "GeometryCollection",
                    "geometries": [{
                        "type": "Polygon",
                        "coordinates": [
                            [
                                ["147.09413785546545", "-36.70243179810273"],
                                ["147.09413785546545", "-36.70243179810273"]
                            ]
                        ]
                    }, {
                        "type": "Point",
                        "coordinates": ["147.17264200000227", "-36.742449004412165"]
                    }, {
                        "type": "Point",
                        "coordinates": ["147.14908499999882", "-36.72445100441112"]
                    }]
                },
                "properties": {
                    feedType: 'safer-place',
                    incidentstage: 'Relief'
                },
                classification:{
                    categories: ['Safer Places']
                }
            };

        otherFeature = {
            geometry: {'type': 'Point'}, properties:{}
        };

        fullFilters = [{
            name: 'Safer Places',
            rules: 'safer-place'
        }];

        app.map = app.map || {};
        app.map.refreshControl = {setRefreshing: function(value){}, setPaused: function(value){}, setUpdatedDate: function(value){}};
        app.map.updatedControl = {setDate: function(){}};
        app.map.removeLayer = function(){};
        app.map.addLayer = function(){};

        appUiSelectFeatureStub = sandbox.stub(app.ui.selection, 'select');
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should initialise with options', function() {
      var geojson = new app.data.controller.geojson({
        filters: [],
        url: 'http://url/file.geojson'
      });
      expect(geojson.url).to.equal('http://url/file.geojson');
    });

    it('should fetch data via ajax call', function() {
      var getJson = sandbox.stub($,'ajax', function(opts){ opts.beforeSend(); opts.success(fullFeature); opts.complete(); });
      sandbox.stub(app.ui.sidebar, 'sync');
      var geojson = new app.data.controller.geojson({
        filters: fullFilters,
        url: 'http://url/file.geojson',
        classifyFeature: function(feature) { return feature.classification; }
      });
      app.templates = {
        popup: {other: function(){return 'template'}}
      };
      sandbox.stub(util.symbology, 'getIcon', function(){ return 'ICON'; });
      sandbox.stub(app.map, 'removeLayer');
      geojson.refreshData(function(){});
      // expect(geojson.clusters['Safer Places'].geoJson.features.length).to.equal(1);
    });

    it('should fetch data via ajax call and filter data', function() {
      var getJson = sandbox.stub($,'ajax', function(opts){ opts.beforeSend(); opts.success(fullFeature); opts.complete(); });
      sandbox.stub(app.ui.sidebar, 'sync');
      var geojson = new app.data.controller.geojson({
        filters: fullFilters,
        url: 'http://url/file.geojson',
        classifyFeature: function(feature) { return feature.classification; },
        dataFilter: function(f){ return false; }
      });
      app.templates = {
        popup: {other: function(){return 'template'}}
      };
      sandbox.stub(util.symbology, 'getIcon', function(){ return 'ICON'; });
      geojson.refreshData(function(){});
      expect(geojson.clusters['Safer Places'].geoJson.features.length).to.equal(0);
    });

    it('should handle an error correctly data during ajax call', function() {
      var getJson = sandbox.stub($,'ajax', function(opts){ opts.beforeSend(); opts.error(); });
      var geojson = new app.data.controller.geojson({
        filters: fullFilters,
        url: 'http://url/file.geojson'
      });
      geojson.refreshData(function(){});
      expect(geojson.clusters['Safer Places'].geoJson.features.length).to.equal(0);
    });

    it('should style each layer', function() {
      var geojson = new app.data.controller.geojson({
        filters: [],
        url: 'http://url/file.geojson',
        classifyFeature: function(feature) { return {style:'style'}; }
      });
      expect(geojson.geoJsonOptions.style(simpleFeature)).to.eql('style');
    });

    it('should convert points to layers', function() {
      app.templates = {
        popup: { 'other': function(){} },
        panel: { 'public-info': function(){} }
      };
      sandbox.stub(L, 'marker', function(latLng, opts){
        return {
          bindPopup: function(){ return {}; },
          getLatLng: function(){ return this.latLng; },
          getBounds: function(){ return {}; },
          on: function(map){ this.events = map; },
          off: function(map){},
          latLng: latLng,
          options: opts
        };
      });
      sandbox.stub(L, 'divIcon', function(opts){ return opts; });
      sandbox.stub(util.symbology, 'getIcon', function(){ return 'ICON'; });

      var geojson = new app.data.controller.geojson({
        filters: [],
        url: 'http://url/file.geojson',
        classifyFeature: function(feature) { return feature; }
      });
      expect(geojson.geoJsonOptions.pointToLayer(simpleFeature, {})).to.have.property('bindPopup');
    });

    it('should configure each layer', function() {
      sandbox.stub(L, 'marker', function(latLng, opts){
        return {
          bindPopup: function(){ return {}; },
          getLatLng: function(){ return this.latLng; },
          getBounds: function(){ return {}; },
          on: function(map){ this.events = map; },
          off: function(map){},
          latLng: latLng,
          options: opts
        };
      });
      sandbox.stub(L, 'divIcon', function(opts){ return opts; });
      sandbox.stub(L, 'stamp', function(layer){ return 'layerid'; });
      sandbox.stub(util.symbology, 'getIcon', function(){ return 'ICON'; });

      app.templates = {
        popup: { 'other': function(){} },
        panel: { 'safer-place': function(){} }
      };
      sandbox.stub(app.templates.panel,'safer-place', function(d){ return d; });

      var geojson = new app.data.controller.geojson({
        filters: [],
        url: 'http://url/file.geojson',
        classifyFeature: function(feature) { feature.classification = {}; return {}; }
      });

      var layer = geojson.geoJsonOptions.pointToLayer(simpleFeature, {});
      geojson.geoJsonOptions.onEachFeature(simpleFeature, layer);
      expect(layer.events).to.have.property('click');
      layer.events.click();
    });

    it('should return a datalayer for the category "Safer Places"', function() {
        var geojson = new app.data.controller.geojson({
            filters: fullFilters,
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        // expect(geojson.getLayerForFilter('Safer Places')).to.not.be.null;
    });

    it('should not return a datalayer for other filter names', function() {
        var geojson = new app.data.controller.geojson({
            filters: fullFilters,
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        // expect(geojson.getLayerForFilter('Not a Preparation Campaigns')).to.be.null;
    });

    it('should return a datalayer for a layer id', function() {
        var geojson = new app.data.controller.geojson({
            filters: fullFilters,
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        var featureLayer = { feature: fullFeature.features[0] };
        var clusterLayer = {
            getLayer: function(id){return featureLayer;}
        };
        geojson.clusters['Safer Places'] = {
            data: clusterLayer
        };
        expect(geojson.getLayer('ID')).to.equal(featureLayer);
    });

    it('should flatten geometry collections to a polygon and a single point in center', function() {
        var geojson = new app.data.controller.geojson({
            filters: fullFilters,
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        geojson.consolidateGeometryCollectionFeature(geometryCollectionFeature);
        expect(geometryCollectionFeature.geometry.geometries.length).to.equal(2);
    });

    it('should return underlying geojson datalayer', function() {
        var geojson = new app.data.controller.geojson({
            filters: fullFilters,
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        geojson.clusters['Safer Places'].data = 'ID';
        expect(geojson.getDataLayers()).to.eql(['ID']);
    });

    it('should do nothing on init', function() {
        var geojson = new app.data.controller.geojson({
            filters: [],
            url: 'http://url/file.geojson',
            classifyFeature: function(feature) { feature.classification = {}; return {}; }
        });
        geojson.init();
    });

  });
})();
