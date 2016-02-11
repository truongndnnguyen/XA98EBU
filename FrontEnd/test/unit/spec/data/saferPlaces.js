(function() {
  'use strict';

  describe("EM-Public Data Safer Places", function() {

    var otherFeature, simpleFeature;

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

        otherFeature = {
            geometry: {'type': 'Point'}, properties:{}
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should classify "other" feature as safer-place', function() {
      app.data.saferPlaces.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('safer-place');
    });

    it('should not reclassify a classified feature', function() {
      app.data.saferPlaces.classifyFeature(otherFeature);
      app.data.saferPlaces.classifyFeature(otherFeature);
      expect(otherFeature.classification.iconClass).to.equal('safer-place');
    });

    it('should classify "safer-place" feature as "Safer Places"', function() {
      app.data.saferPlaces.classifyFeature(simpleFeature);
      expect(simpleFeature.classification.iconClass).to.equal('safer-place');
      expect(simpleFeature.classification.categories).to.eql(['Neighbourhood safer places']);
    });

  });
})();
