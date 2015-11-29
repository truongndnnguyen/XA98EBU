(function() {
  'use strict';

  describe("EM-Public Leaflet Geoserver Web Cache", function() {

    var gwc = null;

    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    before(function() {
        gwc = L.tileLayer.gwc('http://baseurl/{z}/{y}/{x}.png',{});
    });

    it('zeroPad should pad with zeroes', function() {
        expect(gwc.zeroPad(1,2)).to.be.eql('01');
    });

    it('zeroPad should pad with zeroes in base 10', function() {
        expect(gwc.zeroPad(1,2,10)).to.be.eql('01');
    });

    it('zeroPad should pad with zeroes in base 16', function() {
        expect(gwc.zeroPad(10,2,16)).to.be.eql('0a');
    });

    it('getTileUrl should give a tile URL', function() {
        var stub = sandbox.stub(gwc,'_adjustTilePoint', function(f){return f;});
        var stub2 = sandbox.stub(gwc,'_getZoomForUrl', function(f){return f.z;});
        expect(gwc.getTileUrl({x:1,y:2,z:3})).to.contain('/03/01/01.png');
    });

  });
})();
