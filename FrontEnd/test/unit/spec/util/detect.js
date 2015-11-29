(function() {
    'use strict';

    describe("EM-Public Util Detect", function() {
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should detect FireFox as not IE', function() {
            expect(util.detect.isIE()).to.be.false;
        });

        it('should detect IE 8', function() {
            var ua = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';
            expect(util.detect.detectIE(ua)).to.equal(8);
        });

        it('should detect IE 9', function() {
            var ua = 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))';
            expect(util.detect.detectIE(ua)).to.equal(9);
        });

        it('should detect IE 10', function() {
            var ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)';
            expect(util.detect.detectIE(ua)).to.equal(10);
        });

        it('should detect IE 11', function() {
            var ua = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko';
            expect(util.detect.detectIE(ua)).to.equal(11);
        });

        it('should detect IE 12/Edge', function() {
            var ua = 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136';
            expect(util.detect.detectIE(ua)).to.equal(12);
        });

        it('should detect FireFox as not IE', function() {
            var ua = 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0';
            expect(util.detect.detectIE(ua)).to.equal(false);
        });

    });
})();
