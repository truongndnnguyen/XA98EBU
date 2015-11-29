'use strict';
// generated on 2014-09-23 using generator-gulp-webapp 0.1.0

/*
Main usage:

    gulp watch
        For daily development tasks.
        It compiles the source from src/ to build/ and monitors changes in the source files for re-building.
        If an error occurs then after displaying it, stops. If you fixed the error then re-run this command.

*/

// code endpoints to establish for testing purposes:
var endpoints = [
    {path:'/user', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user', method:'POST', responseType: 'application/json', src:'src/api/user/create', name:'em-public-backend-user-create'},
    {path:'/user/verify', method:'POST', responseType: 'application/json', src:'src/api/user/verify', name:'em-public-backend-user-verify'},
    {path:'/user/update', method:'POST', responseType: 'application/json', src:'src/api/user/update', name:'em-public-backend-user-update'},
    {path:'/user/login', method:'POST', responseType: 'application/json', src:'src/api/user/login', name:'em-public-backend-user-login'},
    {path:'/user/pwreset', method: 'POST', responseType: 'application/json', src: 'src/api/user/pwreset', name: 'em-public-backend-user-pwreset' },
    {path:'/user/delete', method:'POST', responseType: 'application/json', src:'src/api/user/delete', name:'em-public-backend-user-delete'},
    // for development of listeners
    {path:'/topic', method:'OPTIONS', responseType: 'application/json'},
    {path:'/topic/firehose', method:'POST', responseType: 'application/json', src:'src/listener/firehose', name:'em-public-backend-topic-firehose'}
];

var subscriptions = [
    {topic:'em-public-firehose-delta', src:'src/listener/firehose', name:'em-public-backend-listener-firehose'}
];

var $ = require('gulp-load-plugins')(),
    gulp = require('gulp'),
    fs = require('fs'),
    runSequence = require('run-sequence'),
    connect = require('connect'),
    cors = require('cors'),
    async = require('async'),
    serveStatic = require('serve-static'),
    connectLambda = require('./gulp/connect-lambda'),
    deployAPI = require('./gulp/deploy-apigateway'),
    deploySNS = require('./gulp/deploy-sns'),
    deployLambda = require('./gulp/deploy-lambda');

var gulpServer, sockets = [];

// primary tasks

gulp.task('build', ['build-templates','build-src']);

gulp.task('clean', function() {
    return gulp.src(['build/'], {read: false})
        .pipe($.clean());
});

gulp.task('deploy', ['deploy-rest-api', 'deploy-subscriptions']);

gulp.task('watch', ['serve'], function(){
    gulp.watch(['src/**/*.js'], ['build-src']);
    gulp.watch(['src/**/*.hbs'], ['build-templates']);
    // gulp.watch(['package.json'], ['build-node_modules']);
});

gulp.task('default', ['watch']);

// build tasks

gulp.task('build-templates', function(){
    return gulp.src(['src/**/*.hbs'])
        .pipe($.changed('build/src/', {extension: '.js'}))
        .pipe($.handlebars({
            handlebars: require('handlebars')
        }))
        .pipe($.defineModule('node'))
        .pipe(gulp.dest('build/src/'));
});

gulp.task('build-src', function(){
    return gulp.src(['src/**/*.js'])
        .pipe($.changed('build/src/'))
        .pipe(gulp.dest('build/src/'));
});

gulp.task('build-packagejson', function() {
    return gulp.src(['package.json'])
        .pipe(gulp.dest('build/'));
});

gulp.task('build-node_modules', ['build-packagejson'], function(cb){
    var exec = require('child_process').exec;
    exec('npm install --production', {
        cwd: 'build'
    }, function (err, stdout, stderr) {
        // console.log(err, stdout, stderr);
        cb(err);
    });
});

gulp.task('clean-zip-lambda', function(){
    return gulp.src(['./build/lambda.zip'])
        .pipe($.clean());
});

gulp.task('zip-lambda', ['clean-zip-lambda','build-node_modules','build'], function(){
    return gulp.src(['./build/**/*'])
        .pipe($.zip('lambda.zip'))
        .pipe(gulp.dest('build'));
});

gulp.task('deploy-lambda', ['zip-lambda'], function(gulpcb) {
    async.map(endpoints.filter(function(endpoint){
        return ('src' in endpoint) && endpoint.src;
    }).concat(subscriptions), deployLambda.deploy, gulpcb);
});

gulp.task('create-rest-api', deployAPI.createAPI);

//gulp.task('create-api-endpoints', ['create-rest-api'], function(gulpcb) {
gulp.task('create-api-endpoints', ['create-rest-api', 'deploy-lambda'], function(gulpcb) {
    async.mapSeries(endpoints, deployAPI.createEndpoint, gulpcb);
});
gulp.task('deploy-rest-api', ['create-api-endpoints'], deployAPI.deployAPI);

gulp.task('deploy-subscriptions', ['deploy-lambda'], function(gulpcb) {
    async.mapSeries(subscriptions, deploySNS.deploy, gulpcb);
});

gulp.task('connect', ['build'], function() {
    var app = connect()
        .use(cors())
        .use(serveStatic('test/'));

    endpoints.filter(function(endpoint){
        return ('src' in endpoint) && endpoint.src;
    }).forEach(function(endpoint){
        app.use(connectLambda.handler(endpoint));
    });

    gulpServer = require('http').createServer(app);

    gulpServer
        .listen(9002)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9002');
        })
        .on('connection', function(sock) {
            sockets.push(sock);
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

gulp.task('serve', ['connect'], function() {
    require('opn')('http://localhost:9002/index.html');
});
