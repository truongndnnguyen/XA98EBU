(function() {
  'use strict';

  describe("EM-Public Data BOM", function() {

    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should initialise the filters', function() {
        app.data.bom.init();
    });

    it('should not support feature-type requests', function() {
        expect(app.data.bom.getDataLayers()).to.eql([]);
        expect(app.data.bom.getLayer()).to.be.null;
    });

    it('should support getLayerForFilter protocol', function() {
        expect(app.data.bom.getLayerForFilter('Rain Radar')).to.not.be.null;
        expect(app.data.bom.getLayerForFilter('NOT A LAYER NAME')).to.be.null;
    });

    it('should support refreshData protocol', function() {
        var cb = {callback: function(){}};
        var callback = sandbox.stub(cb, 'callback');
        app.data.bom.refreshData(cb.callback);
        expect(callback).to.be.called.once;
    });

  });
})();
