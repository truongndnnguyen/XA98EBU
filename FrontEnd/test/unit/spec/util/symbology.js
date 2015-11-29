(function() {
    'use strict';

    describe("EM-Public Util Symbology", function() {

        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            app.templates = {
                icon: {
                    svg: function(){},
                    png: function(){}
                }
            };
            sandbox.stub(app.templates.icon,'svg', function(d){ return d; });
            sandbox.stub(app.templates.icon,'png', function(d){ return d; });
        });

        afterEach(function () {
            sandbox.restore();
        });

        before(function() {
        });

        it('should execute init()', function() {
            util.symbology.init();
        });

        it('should return svg image identifier', function() {
            expect(util.symbology.getImageIdentifier('safer-place','svg')).to.equal('markers--community--Neighbourhood_Safer_Place');
        });

        it('should return class image identifier', function() {
            expect(util.symbology.getImageIdentifier('safer-place','class')).to.equal('icon-Neighbourhood_Safer_Place');
        });

        it('should return image identifier as missing', function() {
            expect(util.symbology.getImageIdentifier('not-a-valid-name','svg')).to.equal('markers--incident--Other_Incident');
        });

        it('should return svg icon', function() {
            expect(util.symbology.getSvgIcon('safer-place',false,'TITLE')).to.eql({svgSymbolId:'markers--community--Neighbourhood_Safer_Place', isCluster:false, assistiveText: 'TITLE'});
        });

        it('should return png icon', function() {
            expect(util.symbology.getPngIcon('safer-place',false,'TITLE')).to.eql({className:'icon-Neighbourhood_Safer_Place', isCluster:false, assistiveText: 'TITLE'});
        });

        it('should return png icon for IE', function() {
            sandbox.stub(util.detect, 'isIE', function(){ return true; });
            expect(util.symbology.getIcon('safer-place',false,'TITLE')).to.eql({className:'icon-Neighbourhood_Safer_Place', isCluster:false, assistiveText: 'TITLE'});
        });

        it('should return svg icon for !IE', function() {
            sandbox.stub(util.detect, 'isIE', function(){ return false; });
            expect(util.symbology.getIcon('safer-place',false,'TITLE')).to.eql({svgSymbolId:'markers--community--Neighbourhood_Safer_Place', isCluster:false, assistiveText: 'TITLE'});
        });

    });
})();
