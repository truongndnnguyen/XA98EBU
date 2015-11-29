(function() {
    'use strict';

    describe("EM-Public Util Cookies", function() {
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        before(function() {
            util.cookies.set('unittest','');
        });

        it('should not have cookie set', function() {
            expect(util.cookies.get('unittest')).to.be.empty;
        });

        it('should set cookie', function() {
            util.cookies.set('unittest','value');
            expect(util.cookies.get('unittest')).to.equal('value');
        });

        it('should set boolean cookie', function() {
            util.cookies.set('unittestbool',true);
            expect(util.cookies.getBoolean('unittestbool',false)).to.be.true;
        });

        it('should default boolean cookie', function() {
            util.cookies.set('unittestbool2','');
            expect(util.cookies.getBoolean('unittestbool2',false)).to.be.false;
        });

        it('should set session cookie', function() {
            util.cookies.set('unittest_session','value',0);
            expect(util.cookies.get('unittest_session')).to.equal('value');
        });

        it('should set integer cookie', function() {
            util.cookies.set('unittestint',123);
            expect(util.cookies.getInteger('unittestint',1000)).to.equal(123);
        });

        it('should default integer cookie if missing', function() {
            util.cookies.set('unittestint2','');
            expect(util.cookies.getInteger('unittestint2',1000)).to.equal(1000);
        });

        it('should default integer cookie if invalid', function() {
            util.cookies.set('unittestint3','not a number');
            expect(util.cookies.getInteger('unittestint3',1000)).to.equal(1000);
        });

        it('should clear all cookies', function() {
            util.cookies.set('cleartest1', 'value');
            expect(util.cookies.get('cleartest1')).to.equal('value');
            util.cookies.set('cleartest2', 'value');
            expect(util.cookies.get('cleartest2')).to.equal('value');
            util.cookies.set('cleartest3', 'value');
            expect(util.cookies.get('cleartest3')).to.equal('value');
            util.cookies.clearAll();
            expect(util.cookies.get('cleartest1')).to.be.null;
            expect(util.cookies.get('cleartest2')).to.be.null;
            expect(util.cookies.get('cleartest3')).to.be.null;
        });
    });
})();
