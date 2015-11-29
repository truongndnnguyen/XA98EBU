(function() {
  'use strict';

  describe("EM-Public Data OSOM", function() {

    var sandbox, features;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        features = {
            other: {
              geometry: {'type': 'Point'}, properties:{feedType:'incident'}
            },
            publicinfo: {
              geometry: {
                'type': 'Point'
              },
              properties: {
                name: 'simpleFeature',
                feedType: 'public-info',
                category1: 'Prepare'
              }
            },
            warning: {
              geometry: {
                'type': 'Point'
              },
              properties: {
                incidentList: [{id:'12345678'}],
                name: 'simpleFeature',
                feedType: 'warning',
                category1: 'Prepare'
              }
            },
            incident: {
              geometry: {
                'type': 'Point'
              },
              properties: {
                name: 'simpleFeature',
                feedType: 'incident',
                category1: 'Fire',
                category2: 'Fire',
                incidentStatus: 'Not Yet Under Control'
              }
            },
            burnarea: {
              geometry: {
                'type': 'Point'
              },
              properties: {
                name: 'simpleFeature',
                feedType: 'burn-area'
              }
            },
            treedown: {
              geometry: {
                'type': 'Point'
              },
              properties: {
                name: 'simpleFeature',
                feedType: 'incident',
                category1: 'Tree Down',
                category2: 'Really Serious'
              }
            }
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    var newEvent = function(feedType, incidentstage) {
        return {
            properties: {
                feedType: feedType,
                category1: incidentstage
            }
        };
    };

    it('should sort features based on riskRating', function() {
        sandbox.stub(app.data.osom, 'classifyFeature', function(f){return f;});
        expect(app.data.osom.featureSort({riskRating:1}, {riskRating:10})).to.equal(-1);
        expect(app.data.osom.featureSort({riskRating:10}, {riskRating:1})).to.equal(1);
        expect(app.data.osom.featureSort({riskRating:10}, {riskRating:10})).to.equal(0);
    });

    it('should filter IN public-info Response events', function() {
        expect(app.data.osom.dataFilter(newEvent('public-info','Response'))).to.be.true;
    });

    it('should filter out non Response public info events', function() {
        expect(app.data.osom.dataFilter(newEvent('public-info','NOT_RESPONSE'))).to.be.false;
    });

    it('should filter IN non public-info events', function() {
        expect(app.data.osom.dataFilter(newEvent('NOT_PUBLIC_INFO','Prepare'))).to.be.true;
    });

    it('should classify "other" feature as unknown', function() {
      app.data.osom.classifyFeature(features.other);
      expect(features.other.classification.iconClass).to.equal('other');
    });

    it('should classify "public-info" feature as public-info', function() {
      app.data.osom.classifyFeature(features.publicinfo);
      expect(features.publicinfo.classification.categories).to.eql(['Warnings']);
    });

    it('should classify warning feature as warning', function() {
      app.data.osom.classifyFeature(features.warning);
      expect(features.warning.classification.categories).to.eql(['Warnings']);
    });

    it('should classify incident feature as Fire / Explosion', function() {
      app.data.osom.classifyFeature(features.incident);
      expect(features.incident.classification.categories).to.eql(['Fire']);
    });

    it('should classify burn-area feature as Fire', function() {
      app.data.osom.classifyFeature(features.burnarea);
      expect(features.burnarea.classification.categories).to.eql(['Fire']);
    });

    it('should classify tree-down feature as Incident with iconClass', function() {
      app.data.osom.classifyFeature(features.treedown);
      expect(features.treedown.classification.categories).to.eql(['Weather','Transport','Other']);
      expect(features.treedown.classification.iconClass).to.equal('tree-down');
    });

    it('should not reclassify a feature', function() {
      app.data.osom.classifyFeature(features.publicinfo);
      expect(features.publicinfo.classification.categories).to.eql(['Warnings']);
      app.data.osom.classifyFeature(features.publicinfo);
    });

    it('should link incidents to warnings', function() {
        var features = [
            {
                properties: {
                    feedType: 'incident',
                    id: 'INCIDENTNO'
                }
            },
            {
                properties: {
                    feedType: 'warning',
                    incidentList: [{id: 'INCIDENTNO'}]
                }
            }
        ];
        app.data.osom.postprocessFeatures(features);
        expect(features[1].properties.incidentFeatures.length).to.equal(1);
        expect(features[1].properties.incidentFeatures[0]).to.eql(features[0]);
    });

  });
})();
