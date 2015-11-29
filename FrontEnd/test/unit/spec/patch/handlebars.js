(function() {
    'use strict';

    describe("EM-Public Patch Handlebars", function() {

        var sym = null;
        var sandbox;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it('should conditionally return value based on equivilence (true)', function() {
            var data = {
                a: '1',
                b: '1'
            };
            var res = Handlebars.compile('{{#is a b}}YES{{else}}NO{{/is}}')(data);
            expect(res).to.eql('YES');
        });

        it('should conditionally return value based on equivilence (true)', function() {
            var data = {
                a: '1',
                b: '2'
            };
            var res = Handlebars.compile('{{#is a b}}YES{{else}}NO{{/is}}')(data);
            expect(res).to.eql('NO');
        });

        it('should iterate the contents of a map', function() {
            var data = {
                'properties' : {
                    'key1':'value1'
                }
            };
            var res = Handlebars.compile('{{#map properties}}{{key}}:{{value}};{{/map}}')(data);
            expect(res.string).to.eql('key1:value1;');
        });

        it('should iterate the contents of a list', function() {
            var data = {
                vals:[
                    {a:'a1', b:'b1'},
                    {a:'a2', b:'b2'}
                ]
            };
            var res = Handlebars.compile('{{#list vals}}{{a}}:{{b}};{{/list}}')(data);
            expect(res.string).to.eql('a1:b1;a2:b2;');
        });

        it('should handle iterate the of an empty list', function() {
            var data = {
            };
            var res = Handlebars.compile('{{#list vals}}{{a}}:{{b}};{{/list}}')(data);
            expect(res.string).to.eql('');
        });

        it('should iterate the contents of a map excluding nulls', function() {
            var data = {
                'properties' : {
                    'key1':'value1',
                    'key2':'value2',
                    'keyNull':'Null'
                }
            };
            var res = Handlebars.compile('{{#map properties}}{{key}}:{{value}};{{/map}}')(data);
            expect(res.string).to.equal('key1:value1;key2:value2;');
        });

        it('should convert a datestamp to a unix time string', function() {
            var date = new Date('2000-01-20T12:00:00');
            var data = { 'date' : '20/01/2000 12:00:00' };
            var res = Handlebars.compile('{{timeEpoch date}}')(data);
            expect(res).to.equal(''+date.getTime());
        });

        it('should convert an invalid datestamp to now unix time string', function() {
            var data = { 'date' : 'Unknown' };
            var res = Handlebars.compile('{{timeEpoch date}}')(data);
            expect(Math.abs(res - (new Date()).getTime())<1000).to.be.true;
        });

        it('should convert a datestamp to a absolute local string', function() {
            var date = new Date('2000-01-20T12:00:00');
            var data = { 'date' : '2000-01-20T12:00:00' };
            var res = Handlebars.compile('{{timeLocal date}}')(data);
            expect(res).to.equal('20/01/2000');
        });

        it('should not convert an invalid datestamp to absolute local, and return input', function() {
            var data = { 'date' : 'Unknown' };
            var res = Handlebars.compile('{{timeLocal date}}')(data);
            expect(res).to.equal('Unknown');
        });

        it('should convert a datestamp to a time ago string', function() {
            var now = new Date();
            var data = { 'date' : now.getDate()+'/'+(1 + now.getMonth())+'/'+(now.getFullYear()-10)+' 00:00:00' };
            var res = Handlebars.compile('{{timeAgo date}}')(data);
            expect(res).to.equal('10 years ago');
        });

        it('should not convert an invalid datestamp to time ago, and return input', function() {
            var data = { 'date' : 'Unknown' };
            var res = Handlebars.compile('{{timeAgo date}}')(data);
            expect(res).to.equal('Unknown');
        });

        it('should convert a layer into an id via stamp', function() {
            var stamp = sandbox.stub(L, 'stamp', function(l) { return l;});
            var data = { 'layer' : 'ID' };
            var res = Handlebars.compile('{{stamp layer}}')(data);
            expect(res).to.equal('ID');
        });

        it('should convert an iconclass to html', function() {
            var stamp = sandbox.stub(util.symbology, 'getIcon', function(ic) { return '<'+ic+'/>';});
            var data = { 'iconClass' : 'TEST' };
            var res = Handlebars.compile('{{icon iconClass}}')(data);
            expect(res).to.equal('<TEST/>');
        });

        it('should display a vehicles responding message when vehicles are present (plural)', function() {
            var data = { 'size' : 'small' };
            var res = Handlebars.compile('{{sizeColumn size 2}}')(data);
            expect(res).to.equal('small - 2 vehicles responding');
        });

        it('should display an empty string when no size info or vehicles are present', function() {
            var data = { 'size' : 'N/A' };
            var res = Handlebars.compile('{{sizeColumn size 0}}')(data);
            expect(res).to.equal('');
        });

        it('should display just vehicles present if no size info', function() {
            var data = { 'size' : 'N/A' };
            var res = Handlebars.compile('{{sizeColumn size 1}}')(data);
            expect(res).to.equal('1 vehicle responding');
        });

    });
})();
