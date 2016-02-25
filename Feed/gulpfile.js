'use strict';

/*
Main usage:

    gulp clean
        Empties the .tmp/, build/, dist/ directories and removes the em-public.zip file.

    gulp unit-test
        run unit tests across the suite

Continuous Integration tasks:

    gulp watch
        For unit test development.
        Executes any changed tests from the unit test suite as they are modified.
*/

var $ = require('gulp-load-plugins')(),
    gulp = require('gulp'),
    runSequence = require('run-sequence');

gulp.task('checkstyle', function() {
    return gulp.src(['src/**/*.js', 'test/unit/**/*.js', '*.js'])
        .pipe($.jshint())
        .pipe($.jshintCheckstyleReporter())
        .pipe(gulp.dest('.'));
});

gulp.task('lint', function() {
    return gulp.src(['src/**/*.js', 'test/unit/**/*.js', '*.json'])
        .pipe($.lintspaces({
            editorconfig: '.editorconfig',
            trailingspaces: false
        }))
        .pipe($.lintspaces.reporter());
});

gulp.task('clean-test-reports', function() {
    return gulp.src(['test/unit/test-results.xml', 'test/unit/coverage'], {
        read: false
    }).pipe($.clean());
});

gulp.task('clean', ['clean-test-reports']);

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

gulp.task('pre-test', function () {
    return gulp.src(['src/**/*.js'])
        .pipe($.istanbul())
        .pipe($.istanbul.hookRequire());
});

gulp.task('unit-test', ['pre-test'], function(done) {
    return gulp.src('test/unit/spec/**/*.js', {read: false})
        .pipe($.mocha({reporter: 'spec'})
                .on("error", handleError))
        .pipe($.istanbul.writeReports({
            dir: './test/coverage',
            reportOpts: { dir: './test/coverage' }
        }));
});

gulp.task('test', ['lint','checkstyle','unit-test']);

gulp.task('watch', ['test'], function() {
    gulp.watch(['src/**/*.js', 'test/unit/**/*.js'], ['test']);
});

gulp.task('build-src', function(){
    return gulp.src(['src/**/*.js'])
        .pipe($.changed('build/src/'))
        .pipe(gulp.dest('build/src/'));
});

gulp.task('build-config', function(){
    return gulp.src(['config/**/*'])
        .pipe($.changed('build/config/'))
        .pipe(gulp.dest('build/config/'));
});

gulp.task('build-rootfiles', function() {
    return gulp.src(['package.json', 'lambda.js'])
        .pipe(gulp.dest('build/'));
});

gulp.task('build-node_modules', ['build-rootfiles'], function(cb){
    var exec = require('child_process').exec;
    exec('npm install --production', {
        cwd: 'build'
    }, function (err, stdout, stderr) {
        // console.log(err, stdout, stderr);
        cb(err);
    });
});

gulp.task('clean-build-zip', function(){
    return gulp.src(['./build/em-public-feed.zip'], {
        read: false
    }).pipe($.clean());
});

gulp.task('build-zip', ['build-src','build-config','build-rootfiles','build-node_modules','clean-build-zip'], function(){
    return gulp.src(['./build/**/*'])
        .pipe($.zip('em-public-feed.zip'))
        .pipe(gulp.dest('build'));
});

gulp.task('clean', function(){
    return gulp.src(['./build/*'], {
        read: false
    }).pipe($.clean());
});

gulp.task('build', ['clean'], function() {
    return gulp.start('build-zip');
});

gulp.task('default', ['clean'], function() {
    return gulp.start('test');
});
