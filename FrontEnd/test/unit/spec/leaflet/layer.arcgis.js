(function() {
  'use strict';

  describe("EM-Public Leaflet ArcGIS", function() {

    var arcgis = null;

    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    before(function() {
        arcgis = L.tileLayer.arcgis('http://baseurl/{z}/{y}/{x}.png',{});
    });

    it('zeroPad should pad with zeroes', function() {
        expect(arcgis.zeroPad(1,2)).to.be.eql('01');
    });

    it('zeroPad should pad with zeroes in base 10', function() {
        expect(arcgis.zeroPad(1,2,10)).to.be.eql('01');
    });

    it('zeroPad should pad with zeroes in base 16', function() {
        expect(arcgis.zeroPad(10,2,16)).to.be.eql('0a');
    });

    it('getTileUrl should give a tile URL', function() {
        var stub = sandbox.stub(arcgis,'_adjustTilePoint', function(f){return f;});
        expect(arcgis.getTileUrl({x:1,y:2,z:3})).to.contain('/L03/R00000002/C00000001.png');
    });

  });
})();
