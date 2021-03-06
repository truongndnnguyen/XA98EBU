'use strict';
// generated on 2014-09-23 using generator-gulp-webapp 0.1.0

/*
Main usage:

    gulp watch
        For daily development tasks.
        It compiles the source from src/ to build/ and monitors changes in the source files for re-building.
        If an error occurs then after displaying it, stops. If you fixed the error then re-run this command.
*/

var lambdaFunctions = [
    {src:'src/listener/email-scaler', name: 'em-public-backend-email-scaler', region: 'us-west-2', timeout: 20},
    {src:'src/listener/deliver', name:'em-public-backend-email-deliver', region: 'us-west-2', timeout: 300}
]

// code endpoints to establish for testing purposes:
var endpoints = [
    {path:'/user', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user', method:'POST', responseType: 'application/json', src:'src/api/user/create', name:'em-public-backend-user-create'},
    {path:'/user/verify', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user/verify', method: 'POST', responseType: 'application/json', src: 'src/api/user/verify', name: 'em-public-backend-user-verify' },
    {path:'/user/unsubscribe', method: 'OPTIONS', responseType: 'application/json' },
    {path:'/user/unsubscribe', method: 'POST', responseType: 'application/json', src: 'src/api/user/unsubscribe', name: 'em-public-backend-user-unsubscribe' },
    {path:'/user/update', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user/update', method:'POST', responseType: 'application/json', src:'src/api/user/update', name:'em-public-backend-user-update'},
    {path:'/user/login', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user/login', method:'POST', responseType: 'application/json', src:'src/api/user/login', name:'em-public-backend-user-login'},
    {path:'/user/pwreset', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user/pwreset', method: 'POST', responseType: 'application/json', src: 'src/api/user/pwreset', name: 'em-public-backend-user-pwreset' },
    {path:'/user/delete', method:'OPTIONS', responseType: 'application/json'},
    {path:'/user/delete', method:'POST', responseType: 'application/json', src:'src/api/user/delete', name:'em-public-backend-user-delete'},
    // for development of listeners
    {path:'/topic', method:'OPTIONS', responseType: 'application/json'},
    {path:'/topic/firehose', method:'OPTIONS', responseType: 'application/json'},
    {path:'/topic/firehose', method:'POST', responseType: 'application/json', src:'src/listener/firehose', name:'em-public-backend-topic-firehose'},
    {path:'/topic/es-index', method:'OPTIONS', responseType: 'application/json'},
    {path:'/topic/es-index', method:'POST', responseType: 'application/json', src:'src/listener/es-index', name:'em-public-backend-topic-es-index'}
];

var subscriptions = [
    {topic:'em-public-firehose-delta', src:'src/listener/firehose', name:'em-public-backend-listener-firehose', region: 'ap-northeast-1'},
    {topic:'ses-bounce-topic', src:'src/listener/ses-bounce-processor', name:'ses-bounce-topic-processor', region: 'us-west-2'}
    // {topic:'em-public-firehose-delta', src:'src/listener/deliver', name:'em-public-backend-listener-deliver'}
];

var AWS_NAMESPACE = process.env.AWS_NAMESPACE || 'LOCAL';
endpoints.concat(subscriptions).concat(lambdaFunctions).map(function(ep){
    if( ep.path ) {
        ep.path = '/' + AWS_NAMESPACE + ep.path;
    }
    if( ep.name ) {
        ep.name = ep.name + '_' + AWS_NAMESPACE;
    }
})
endpoints.unshift({path:'/'+AWS_NAMESPACE, method:'OPTIONS', responseType:'application/json'});

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

gulp.task('build', ['build-templates','build-src','build-config']);

gulp.task('clean', function() {
    return gulp.src(['build/'], {read: false})
        .pipe($.clean());
});

gulp.task('deploy', ['deploy-rest-api', 'deploy-subscriptions']);

gulp.task('watch', ['serve'], function(){
    gulp.watch(['src/**/*.js', 'src/*.js'], ['build-src']);
    gulp.watch(['config/**/*.json'], ['build-config']);
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

gulp.task('build-config-default', function(){
    return gulp.src(['config/**/default.json'])
        .pipe($.rename("config.json"))
        .pipe(gulp.dest('build/src/'));
});

gulp.task('build-config', ['build-config-default','build-config-lambdas'], function(){
    return gulp.src(['config/**/'+AWS_NAMESPACE.toLowerCase()+'.json'])
        .pipe($.rename("config.json"))
        .pipe(gulp.dest('build/src/'));
});

gulp.task('build-config-lambdas-default', function(){
    return gulp.src(['config/lambda_configs/default/*.json'])
        .pipe(gulp.dest('build/src/lambda_configs/'));
});

gulp.task('build-config-lambdas',['build-config-lambdas-default'], function(){
    return gulp.src(['config/lambda_configs/'+AWS_NAMESPACE+'/*.json'])
        .pipe(gulp.dest('build/src/lambda_configs/'));
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

gulp.task('deploy-lambda', ['deploy-lambda-region', 'deploy-lambda-tokyo']);

gulp.task('deploy-lambda-tokyo', ['zip-lambda'], function(gulpcb) {
    async.map(endpoints.filter(function(endpoint){
        return ('src' in endpoint) && endpoint.src;
    }), deployLambda.deployToTokyo, gulpcb);
});

gulp.task('deploy-lambda-region', ['zip-lambda'], function(gulpcb) {
    async.map(lambdaFunctions.concat(subscriptions), deployLambda.deployWithRegion, gulpcb);
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
