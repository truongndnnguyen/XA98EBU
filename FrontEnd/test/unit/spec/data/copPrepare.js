(function() {
  'use strict';

  describe("EM-Public Data COP Prepare", function() {

    var sandbox;

    var simpleFeature = {
      geometry: {
        'type': 'Point'
      },
      properties: {
        name: 'simpleFeature',
        feedType: 'public-info',
        category1: 'Prepare'
      }
    };

    var otherFeature = {
      geometry: {'type': 'Point'}, properties:{}
    };

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should classify "other" feature as unknown', function() {
      app.data.copPrepare.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('other');
    });

    it('should not reclassify a classified feature', function() {
      app.data.copPrepare.classifyFeature(otherFeature);
      app.data.copPrepare.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('other');
    });

    it('should classify "public-info" feature as "Preparation Campaigns"', function() {
      app.data.copPrepare.classifyFeature(simpleFeature);
      expect(simpleFeature.classification.iconClass).to.equal('public-info');
      expect(simpleFeature.classification.categories).to.eql(['Preparation Campaigns']);
    });

    var newEvent = function(feedType, incidentstage) {
        return {
            properties: {
                feedType: feedType,
                category1: incidentstage
            }
        };
    };

    it('should filter IN public-info Prepare events', function() {
        expect(app.data.copPrepare.dataFilter(newEvent('public-info','Prepare'))).to.be.true;
    });

    it('should filter out non Prepare events', function() {
        expect(app.data.copPrepare.dataFilter(newEvent('public-info','NOT_PREPARE'))).to.be.false;
    });

    it('should filter out non public-info events', function() {
        expect(app.data.copPrepare.dataFilter(newEvent('NOT_PUBLIC_INFO','Prepare'))).to.be.false;
    });

  });
})();
