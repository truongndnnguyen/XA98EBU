module.exports = function(config) {
    config.set({
        basePath: '.',
        files: [
            '../../app/bower_components/jquery/dist/jquery.js',
            '../../app/bower_components/leaflet/dist/leaflet-src.js',
            '../../app/bower_components/bootstrap/dist/js/bootstrap.js',
            '../../app/bower_components/leaflet.markercluster/dist/leaflet.markercluster-src.js',
            '../../app/bower_components/leaflet.locatecontrol/dist/L.Control.Locate.min.js',
            '../../app/bower_components/typeahead.js/dist/typeahead.bundle.js',
            '../../app/bower_components/list.js/dist/list.js',
            '../../app/bower_components/es5-shim/es5-shim.js',
            '../../app/bower_components/proj4/dist/proj4-src.js',
            '../../app/bower_components/proj4leaflet/src/proj4leaflet.js',
            '../../app/bower_components/handlebars/handlebars.js',
            '../../app/bower_components/typeahead-addresspicker/dist/typeahead-addresspicker.js',
            '../../app/bower_components/bootstrap-switch/dist/js/bootstrap-switch.js',
            '../../app/bower_components/moment/min/moment-with-locales.min.js',

            '../../app/vendor_components/**/*.js',

            '../../app/scripts/util/*.js',
            '../../app/scripts/rules/*.js',
            '../../app/scripts/**/*.js',

            'spec/**/*.js'
        ],
        coverageReporter: {
            dir: 'coverage/',
            reporters: [{
                type: 'html',
                subdir: 'html'
            }, {
                type: 'cobertura',
                subdir: '.',
                file: 'cobertura.xml'
            }, {
                type: 'text',
                subdir: '.',
                file: 'text.txt'
            }, {
                type: 'text-summary',
                subdir: '.',
                file: 'text-summary.txt'
            }]
        },
        reporters: ['progress', 'coverage', 'dots', 'junit'],
        preprocessors: {
            '../../app/scripts/*.js': ['coverage'],
            '../../app/scripts/!(ui)/**/*.js': ['coverage'],
            '../../app/scripts/ui/selection.js': ['coverage'],
        },
        frameworks: ['mocha', 'chai-sinon'],
        browsers: ['PhantomJS']
    });
};
