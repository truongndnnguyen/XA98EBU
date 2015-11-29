(function() {
    'use strict';

    describe("EM-Public Util Rules", function() {

        var rulesets = [
            {
                name: 'ruleset 1',
                rules: [
                    ['ruleset1cat1','ruleset1cat2']
                ]
            },
            {
                name: 'ruleset 2',
                rules: [
                    ['ruleset2cat1','ruleset2cat2'],
                    ['ruleset2cat3','ruleset2cat4']
                ]
            },
            {
                name: 'ruleset 3',
                rules: [
                    ['ruleset3cat1','*']
                ]
            },
            {
                name: 'ruleset 4',
                rules: [
                    ['*']
                ]
            }
        ];

        var rulesets_no_wildcard = [
            {
                name: 'ruleset 1',
                rules: [
                    ['ruleset1cat1','ruleset1cat2']
                ]
            }
        ];

        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should match with cat1 and cat2', function() {
            var vals = ['ruleset1cat1','ruleset1cat2'];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 1');
        });

        it('should match with cat1 and cat2 with first of multiple rules', function() {
            var vals = ['ruleset2cat1','ruleset2cat2'];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 2');
        });

        it('should match with cat1 and cat2 with second of multiple rules', function() {
            var vals = ['ruleset2cat3','ruleset2cat4'];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 2');
        });

        it('should match with cat1 and *', function() {
            var vals = ['ruleset3cat1'];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 3');
        });

        it('should match an empty with *', function() {
            var vals = [];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 4');
        });

        it('should match an unknown with *', function() {
            var vals = ['notacat'];
            expect(util.rules.execute(rulesets, vals)).to.have.property('name', 'ruleset 4');
        });

        it('should not match if there is no wildcard', function() {
            var vals = ['notacat'];
            expect(util.rules.execute(rulesets_no_wildcard, vals)).to.be.null;
        });

    });
})();
