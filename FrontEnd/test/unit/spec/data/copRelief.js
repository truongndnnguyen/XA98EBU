(function() {
  'use strict';

  describe("EM-Public Data COP Relief", function() {

    var otherFeature, simpleFeature;

    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        simpleFeature = {
            geometry: {
                'type': 'Point'
            },
            properties: {
                feedType: 'public-info',
                category1: 'Relief'
            }
        };

        otherFeature = {
            geometry: {'type': 'Point'}, properties:{}
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should classify "other" feature as unknown', function() {
      app.data.copRelief.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('other');
    });

    it('should not reclassify a classified feature', function() {
      app.data.copRelief.classifyFeature(otherFeature);
      app.data.copRelief.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('other');
    });

    it('should classify "public-info" feature as "Major Recovery"', function() {
      app.data.copRelief.classifyFeature(simpleFeature);
      expect(simpleFeature.classification.iconClass).to.equal('public-info');
      expect(simpleFeature.classification.categories).to.eql(['Major Recovery']);
    });

    var newEvent = function(feedType, incidentstage) {
        return {
            properties: {
                feedType: feedType,
                category1: incidentstage
            }
        };
    };

    it('should filter IN public-info Recovery events', function() {
        expect(app.data.copRelief.dataFilter(newEvent('public-info','Recovery'))).to.be.true;
    });

    it('should filter out non Recovery events', function() {
        expect(app.data.copRelief.dataFilter(newEvent('public-info','NOT_Recovery'))).to.be.false;
    });

    it('should filter out non public-info events', function() {
        expect(app.data.copRelief.dataFilter(newEvent('NOT_PUBLIC_INFO','Recovery'))).to.be.false;
    });

  });
})();
