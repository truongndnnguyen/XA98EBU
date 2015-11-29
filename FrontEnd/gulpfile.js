'use strict';
// generated on 2014-09-23 using generator-gulp-webapp 0.1.0

/*
Main usage:

    gulp clean
        Empties the .tmp/, build/, dist/ directories and removes the em-public.zip file.

    gulp compile
        Compiles the project into the build/ directory without tests, uglifying and minimising.

    gulp build
        Compiles the project into the build/ directory with unit tests but without uglifying and minimising.

    gulp dist
        Compiles the project into the dist/ directory with uglifying and minimising.

    gulp ci-tests
        Executes the functional test suite (test/functional) against the dist package.

    gulp package
        Creates em-public.zip from the content of the dist/ directory.

Continuous Integration tasks:

    gulp watch
        For daily development tasks.
        It compiles the source from app/ to build/ and monitors changes in the source files for re-building.
        If an error occurs then after displaying it, stops. If you fixed the error then re-run this command.

    gulp unit-watch
        For unit test development.
        Executes any changed tests from the unit test suite as they are modified.

    gulp functional-watch
        For functional test development.
        Executes any changed tests from the functional test suite as they are modified.

*/

var $ = require('gulp-load-plugins')();

var gulp = require('gulp'),
    karma = require('karma').Server,
    mainBowerFiles = require('main-bower-files'),
    fs = require('fs'),
    runSequence = require('run-sequence'),
    merge = require('merge-stream'),
    debug = require('gulp-debug');

var gulpServer, sockets = [];

gulp.task('lint', function() {
    return gulp.src(['app/scripts/**/*.js', 'gulpfile.js', 'package.json', 'bower.json'])
        .pipe($.lintspaces({
            editorconfig: '.editorconfig',
            trailingspaces: false
        }))
        .pipe($.lintspaces.reporter());
});

gulp.task('icons', function() {
    return gulp.src('app/bower_components/font-awesome/fonts/**.*')
        .pipe(gulp.dest('.tmp/fonts'))
        .pipe($.size());
});

gulp.task('styles', ['icons'], function() {
    return gulp.src(['app/styles/*.scss', 'app/styles/*.css'])
        .pipe($.sass())
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('templates', function() {
    return gulp.src(['app/templates/**/*.hbs'])
        .pipe($.handlebars())
        .pipe($.wrap('Handlebars.template(<%= contents %>)'))
        .pipe($.declare({
            namespace: 'app.templates',
            noRedeclare: true, // Avoid duplicate declarations
        }))
        .pipe($.concat('templates.js'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe($.size());
});

gulp.task('scripts', ['lint'], function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshintCheckstyleReporter())
        .pipe(gulp.dest('.'))
        .pipe($.size());
});

gulp.task('html', ['images', 'styles', 'scripts', 'templates'], function() {
    $.util.log('Building to the destination directory: \'build\'');
    return gulp.src(['app/html_fragments/**/*.html', '!app/html_fragments/**/_*.html'])

        // construct the src html from fragements
        .pipe($.fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('build'))

        // replace version tag in source
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))

        // render the html into the dist form and location
        .pipe($.useref.assets({
            searchPath: '{.tmp,app}'
        }))
        // replace version tag in source
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('build'))
        .pipe($.size());
});

gulp.task('html-dist', ['images', 'styles', 'scripts', 'templates'], function() {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    $.util.log('Uglifiying to the destination directory: \'dist\'');
    return gulp.src(['app/html_fragments/**/*.html', '!app/html_fragments/**/_*.html'])

        // construct the src html from fragements
        .pipe($.fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist'))

        // replace version tag in source
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))

        // render the html into the dist form and location
        .pipe($.useref.assets({
            searchPath: '{.tmp,app}'
        }))
        .pipe(jsFilter)
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('./dist'))
        .pipe($.size());
});

gulp.task('other-dist', ['images', 'fonts', 'styles', 'extras', 'data'], function() {
    return gulp.src(['build/**/*', '!build/*.html', '!build/styles/*.css', '!build/scripts/**/*.js'])
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('ga', function() {
    return gulp.src('dist/*.html')
        .pipe($.ga({
            url: 'auto',
            uid: (process.env.PROD ? 'UA-56409821-1' : 'UA-56271660-1'),
            tag: 'body'
        }))
        .pipe(gulp.dest('./dist'))
        .pipe($.size());
});

gulp.task('absolute-static', function() {
    var publicPath = '//' + process.env.PUBLIC_PATH || '//public-info.dev.devcop.em.vic.gov.au';
    return gulp.src('./dist/*.html')
        .pipe($.cdnizer({
            defaultCDNBase: publicPath + "/em-public",
            allowRev: true,
            allowMin: true,
            // relativeRoot: 'styles',
            files: [
                'scripts/**/*.*',
                'styles/**/*.*',
                'fonts/**/*.*',
                '*.*'
            ]
        }))
        .pipe(gulp.dest('./dist'))
        .pipe($.size());
});

gulp.task('app-images', function() {
    return gulp.src(['app/images/**/*.png', 'app/images/**/*.jpg', 'app/images/**/*.gif', 'app/images/logos/vic_gov_logo.svg'])
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
});

gulp.task('svg2png', function() {
    return gulp.src('app/images/**/*.svg')
        .pipe($.changed('.tmp/images', {extension: '.png'}))
        .pipe($.svg2png())
        .pipe(gulp.dest('.tmp/images'))  // we save the svg->png results into .tmp/ because create-png-sprite needs real files, not streams. See more: https://github.com/twolfson/gulp.spritesmith/issues/53
        .pipe($.size());
});

gulp.task('create-png-sprite-keys', function() {
    var spriteData = gulp.src('app/images/keys/**/*.png')
        .pipe($.spritesmith({
            imgName: '../images/sprite_keys.png',
            cssName: 'sprite_keys.css',
            padding: 10,
            engine: require('phantomjssmith'),
            cssVarMap: function (sprite) {
                sprite.name = 'keys-' + sprite.name;
            }
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
    var cssStream = spriteData.css
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
    return merge(imgStream, cssStream);
});

gulp.task('create-png-sprite-controls', ['svg2png'], function() {
    var spriteData = gulp.src('.tmp/images/controls/common/**/*.png')
        .pipe($.spritesmith({
            imgName: '../images/sprite_controls.png',
            cssName: 'sprite_controls.css',
            padding: 10,
            engine: require('phantomjssmith'),
            cssVarMap: function (sprite) {
                sprite.name = 'controls-' + sprite.name;
            }
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
    var cssStream = spriteData.css
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
    return merge(imgStream, cssStream);
});

gulp.task('create-svg-sprite-controls', function() {
    var config = {
        mode : {
            css             : {     // Activate the «css» mode
                render      : {
                    css     : true  // Activate CSS output (with default options)
                },
                prefix: ".icon-%s",
                layout: 'packed',
                sprite: 'svg/sprite-controls.svg',
                bust  : false
            },
        },
        shape: {
            id: {
                generator: 'controls-%s'   // we add the markers/ directory to the IDs within the SVG sprite.
            }
        }
    };

    return gulp.src('app/images/controls/common/**/*.svg')
        .pipe($.svgSprite(config))
        .pipe($.prettify({indent_size: 4}))
        .pipe(gulp.dest('.tmp/styles/controls'))
        .pipe($.size());
});

gulp.task('create-svg-sprite-media-mobile', function() {
    var config = {
        mode : {
            css             : {     // Activate the «css» mode
                render      : {
                    css     : true  // Activate CSS output (with default options)
                },
                prefix: '.icon-%s',
                sprite: 'svg/sprite.media-mobile.svg',
                layout: 'packed',
                bust  : false
            },
        },
        shape: {
            id: {
                generator: 'media-%s'   // we add the markers/ directory to the IDs within the SVG sprite.
            }
        }
    };

    return gulp.src('app/images/controls/mobile/**/*.svg')
        .pipe($.svgSprite(config))
        .pipe($.prettify({indent_size: 4}))
        .pipe(gulp.dest('.tmp/styles/media-mobile'))
        .pipe($.size());
});

gulp.task('create-svg-sprite-media-desktop', function() {
    var config = {
        mode : {
            css             : {     // Activate the «css» mode
                render      : {
                    css     : true  // Activate CSS output (with default options)
                },
                prefix: '.icon-%s',
                sprite: 'svg/sprite.media-desktop.svg',
                layout: 'packed',
                bust  : false
            },
        },
        shape: {
            id: {
                generator: 'media-%s'   // we add the markers/ directory to the IDs within the SVG sprite.
            }
        }
    };

    return gulp.src('app/images/controls/desktop/**/*.svg')
        .pipe($.svgSprite(config))
        .pipe($.prettify({indent_size: 4}))
        .pipe(gulp.dest('.tmp/styles/media-desktop'))
        .pipe($.size());
});

gulp.task('build-svg-sprite-controls', ['create-svg-sprite-controls', 'create-svg-sprite-media-mobile',
    'create-svg-sprite-media-desktop'], function() {
    return gulp.src(['.tmp/styles/**/*.svg'])
        .pipe($.flatten())
        .pipe(gulp.dest('build/styles/svg'))
        .pipe($.size());
});

gulp.task('create-png-sprite-media-mobile', ['svg2png'], function() {
    var spriteData = gulp.src('.tmp/images/controls/mobile/**/*.png')
        .pipe($.spritesmith({
            imgName: '../images/sprite_controls_mobile.png',
            cssName: 'sprite_controls_mobile.css',
            padding: 10,
            engine: require('phantomjssmith'),
            cssVarMap: function (sprite) {
                sprite.name = 'media-' + sprite.name;
            }
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
    var cssStream = spriteData.css
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
    return merge(imgStream, cssStream);
});

gulp.task('create-png-sprite-media-desktop', ['svg2png'], function() {
    var spriteData = gulp.src('.tmp/images/controls/desktop/**/*.png')
        .pipe($.spritesmith({
            imgName: '../images/sprite_controls_desktop.png',
            cssName: 'sprite_controls_desktop.css',
            padding: 10,
            engine: require('phantomjssmith'),
            cssVarMap: function (sprite) {
                sprite.name = 'media-' + sprite.name;
            }
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
    var cssStream = spriteData.css
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
    return merge(imgStream, cssStream);
});

gulp.task('create-png-sprite', ['svg2png'], function() {
    var spriteData = gulp.src('.tmp/images/markers/**/*.png')
        .pipe($.spritesmith({
            imgName: '../images/sprite.png',
            cssName: 'sprite.css',
            padding: 10
        }));
    var imgStream = spriteData.img
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
    var cssStream = spriteData.css
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
    return merge(imgStream, cssStream);
});

gulp.task('create-svg-sprite', function() {
    var config = {
        mode : {
            inline: true,
            symbol: true
        },
        shape: {
            id: {
                generator: 'markers--%s'   // we add the markers/ directory to the IDs within the SVG sprite.
            }
        }
    };

    return gulp.src('app/images/markers/**/*.svg')
        .pipe($.svgSprite(config))
        .pipe($.prettify({indent_size: 4}))
        .pipe(gulp.dest('build/images'))
        .pipe($.size());
});

gulp.task('deps-images', function() {
    return gulp.src('app/bower_components/leaflet/dist/images/*')
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('build/styles/images'))
        .pipe($.size());
});

gulp.task('data', function() {
    return gulp.src('app/data/**/*')
        .pipe(gulp.dest('build/data'))
        .pipe($.size());
});

gulp.task('images', ['app-images', 'create-svg-sprite', 'create-png-sprite',
    'create-png-sprite-keys', 'create-png-sprite-controls', 'create-png-sprite-media-desktop',
    'build-svg-sprite-controls', 'create-png-sprite-media-mobile', 'deps-images']);

gulp.task('fonts', function() {
    return gulp.src([
        'app/fonts/**/*.{eot,svg,ttf,woff}',
        'app/bower_components/font-awesome/fonts/**.*',
        'app/bower_components/bootstrap/dist/fonts/**.*'
    ])
        .pipe($.flatten())
        .pipe(gulp.dest('build/fonts'))
        .pipe($.size());
});

gulp.task('extras', function() {
    return gulp.src(['app/*.*', '!app/*.html'], {
            dot: true
        })
        .pipe(gulp.dest('build'))
        .pipe($.size());
});

gulp.task('clear', function(done) {
    return $.cache.clearAll(done);
});

gulp.task('clean-test-reports', function() {
    return gulp.src(['test/unit/test-results.xml', 'test/unit/coverage'], {
        read: false
    }).pipe($.clean());
});

gulp.task('clean', ['clear'], function() {
    return gulp.src(['.tmp', 'build', 'dist', 'em-public.zip'], {
        read: false
    }).pipe($.clean());
});

gulp.task('connect', ['build'], function() {
    return gulp.start('connect-quick');
});

gulp.task('connect-quick', function() {
    var connect = require('connect');
    var cors = require('cors');
    var app = connect()
        .use(require('connect-modrewrite')(['^/api/(.*)$ http://localhost:9002/$1 [P]']))
        .use(require('connect-livereload')({
            port: 35729
        }))
        .use(cors())
        .use(require('morgan')('tiny', {
            skip: function (req, res) { return res.statusCode < 400 }
        }))
        .use(connect.static('build'))
        .use(connect.static('.tmp'))
        .use(connect.directory('build'))
        .use(require('connect-modrewrite')(['^/remote/data/(.*)$ http://public-info.ci.devcop.em.vic.gov.au/em-public/qa/20/data/$1 [P]']))
        .use(require('connect-modrewrite')(['^/public/(.*)$ http://public-info.ci.devcop.em.vic.gov.au/public/$1 [P]']))
        .use(require('connect-modrewrite')(['^/2013-01-01/(.*)$ http://em-public.ci.devcop.em.vic.gov.au/2013-01-01/$1 [P]']))
        .use(require('connect-modrewrite')(['^/public/osom-fdrtfb.json$ http://em-public.ci.devcop.em.vic.gov.au/public/osom-fdrtfb.json [P]']));

    gulpServer = require('http').createServer(app)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000');
        })
        .on('connection', function(sock) {
            sockets.push(sock);
        });
});

gulp.task('connect-dist', ['dist'], function() {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({
            port: 35729
        }))
        .use(connect.static('dist'))
        .use(connect.static('.tmp'))
        .use(connect.directory('dist'));

    gulpServer = require('http').createServer(app);
    gulpServer
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000');
        })
        .on('connection', function(sock) {
            sockets.push(sock);
        });
});

gulp.task('serve', ['connect'], function() {
    require('opn')('http://localhost:9000');
});

gulp.task('unit-test', function(done) {
    karma.start({
        configFile: __dirname + '/test/unit/karma.conf.js',
        singleRun: true
    }, function(code) {
        if (code == 1){
        console.log('Unit Test failures, exiting process');
            console.log('Unit Tests FAILED');
            // done('Unit Test Failures'); // uncomment to fail build if unit test fail
            done();
        } else {
            console.log('Unit Tests passed');
            done();
        }
    });
});

gulp.task('unit-watch', function() {
    new karma({
        configFile: __dirname + '/test/unit/karma.conf.js'
    }).start();
});

gulp.task('functional-bundle', function(gulpCallBack) {
    var spawn = require('child_process').spawn;
    var guardChild = spawn('bundle', ['install'], {
        cwd: 'test/functional'
    });
    guardChild.stdout.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });
    guardChild.stderr.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });
    guardChild.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : 'ERROR: bundle install process exited with code: '+code);
    });
});

gulp.task('functional-watch', ['connect', 'functional-bundle'], function(gulpCallBack) {
    var spawn = require('child_process').spawn;
    var guardChild = spawn('bundle', ['exec', 'guard', '--no-interactions'], {
        cwd: 'test/functional'
    });
    guardChild.stdout.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });
    guardChild.stderr.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });
    guardChild.on('close', function(code) {
        gulpCallBack(code === 0 ? null : 'ERROR: guard process exited with code: '+code);
        gulp.start('unserve');
    });
});

gulp.task('functional-test', function() {
    var spawn = require('cross-spawn');
    var rspecChild = spawn('rake', [], {
        cwd: 'test/functional'
    });

    rspecChild.stdout.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });

    rspecChild.stderr.on('data', function(data) {
        console.log(data.toString().slice(0, -1)); // Remove \n
    });

    rspecChild.on('close', function(code) {
        var success = code === 0; // Will be 1 in the event of failure
        if (!success) {
            throw new Error('thwump');
        }
        gulp.start('unserve');
    });
});

gulp.task('unserve', function() {
    if (sockets && gulpServer) {
        for (var i = 0; i < sockets.length; i++) {
            sockets[i].destroy();
        }

        gulpServer.close();
    }
});

gulp.task('ci-tests', ['connect-dist'], function() {
    return gulp.start('functional-test');
});

// inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('package', ['dist'], function() {
    return gulp.src('dist/**/*')
        .pipe($.zip('em-public.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('compile', ['html', 'fonts', 'extras', 'data']);

gulp.task('build', ['compile', 'unit-test']);

gulp.task('dist', ['html-dist', 'other-dist']);

gulp.task('default', ['clean'], function() {
    return gulp.start('build');
});

gulp.task('update-build-timestamp', function() {
    fs.writeFile('build/build_time.txt', Date.now());
});

gulp.task('html-watch', function() {
    $.util.log('Building to the destination directory: \'build\'');
    return gulp.src(['app/html_fragments/**/*.html', '!app/html_fragments/**/_*.html'])

        // construct the src html from fragements
        .pipe($.fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('build'))

        // replace version tag in source
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))

        // render the html into the dist form and location
        .pipe($.useref.assets({
            searchPath: '{.tmp,app}'
        }))
        // replace version tag in source
        .pipe($.replace('$BUILD_VERSION_TAG',process.env.BUILD_VERSION_TAG))
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('build'))
        .pipe($.size());
});

gulp.task('watch', ['serve'], function() {
    var server = $.livereload();
    // watch for changes

    gulp.watch('app/html_fragments/**/*').on('change', function(file) {
        runSequence(['html-watch'], 'update-build-timestamp');
    });

    gulp.watch(['app/styles/**/*', 'app/vendor_components/**/*.css']).on('change', function(file) {
        runSequence(['styles'], 'html', 'update-build-timestamp');
    });

    gulp.watch(['app/scripts/**/*.js', 'app/vendor_components/**/*.js']).on('change', function(file) {
        runSequence(['scripts', 'html', 'unit-test'],'update-build-timestamp');
    });

    gulp.watch(['test/unit/spec/**/*.js']).on('change', function(file) {
        runSequence(['unit-test'],'update-build-timestamp');
    });

    gulp.watch(['app/templates/**/*.hbs']).on('change', function(file) {
        runSequence(['templates', 'html'],'update-build-timestamp');
    });

    gulp.watch('app/data/**/*.js').on('change', function(file) {
        runSequence(['data'], 'update-build-timestamp');
    });

    gulp.watch('app/images/**/*').on('change', function(file) {
        runSequence(['images','html'], 'update-build-timestamp');
    });

    gulp.watch('bower.json').on('wiredep', function(file) {
        runSequence(['wiredep'], 'update-build-timestamp');
    });

    gulp.watch('build/build_time.txt').on('change', function(file) {
        server.changed(file.path);
    });
});
