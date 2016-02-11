var AWS = require('aws-sdk'),
    fs = require('fs');

var role = 'arn:aws:iam::644368612228:role/em-public-backend-lambda';

function zip(src) {
    var zip = new require('node-zip')();
    zip.file(src, fs.readFileSync(src));
    var zipfile = zip.generate({base64:false,compression:'DEFLATE'});
    fs.writeFileSync('tmp.zip',zipfile,'binary');
    zipfile = fs.readFileSync('tmp.zip');
    fs.unlinkSync('tmp.zip');
    return zipfile;
}

function loadZip(src) {
    return fs.readFileSync(src);
}


exports.deployWithRegion = function(endpoint, cb) {
    var name = endpoint.name,
        module = endpoint.src,
        src = endpoint.src+'.js',
        awsRegion = endpoint.region,
        timeout = endpoint.timeout;

    AWS.config.update({region: awsRegion});
    var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
    // var zipfile = zip(src);
    var zipfile = loadZip('build/lambda.zip');

    lambda.getFunction({
        FunctionName: name
    }, function(err, data) {
        if( err ) {
            if( err.code === 'ResourceNotFoundException' ) {
                console.log('uploading lambda function: '+name);
                var params = {
                    Code: { /* required */
                        ZipFile: zipfile
                    },
                    FunctionName: name,
                    Handler: module + '.handler',
                    Role: role,
                    Runtime: 'nodejs',
                    // MemorySize: 0,
                    Timeout: timeout,
                    Publish: true
                };

                return lambda.createFunction(params, function(err, data) {
                    return cb(err);
                });
            } else {
                return cb(err);
            }
        } else {
            console.log('updating lambda function: '+name);
            var updateConfig = ( data.Configuration.Handler !== module + '.handler' );
            return lambda.updateFunctionCode({
                ZipFile: zipfile,
                FunctionName: name
            }, function(err, data) {
                if(err) return cb(err);
                if( updateConfig ) {
                    console.log('updating lambda function configuration: '+name);
                    return lambda.updateFunctionConfiguration({
                        FunctionName: name,
                        Handler: module + '.handler'
                    }, function(err,data){
                        return cb(err);
                    });
                } else {
                    return cb(err);
                }
            });
        }
    });
};

exports.deployToTokyo = function(endpoint, cb) {
    endpoint.region = 'ap-northeast-1'
    exports.deployWithRegion(endpoint, cb);
};
