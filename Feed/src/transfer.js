var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    xml2jsProcessors = require('xml2js').processors,
    xml2js = new require('xml2js').Parser({tagNameProcessors : [xml2jsProcessors.stripPrefix]}),
    moment = require('moment-timezone'),
    Hashes = require('jshashes'),
    aws = require('aws-sdk'),
    url = require('url'),
    once = require('once'),
    S3 = null,
    fs = require('fs'),
    log = require('./log'),
    cacheBucket = null,
    localStorage = true,
    zlib = require('zlib'),
    jsftp = require('jsftp');

exports.configure = function(config) {
    localStorage = config.LOCAL_CACHE;
    cacheBucket = config.S3_BUCKET;
    if( config.AWS_ACCESS_KEY && config.AWS_SECRET_ACCESS_KEY ) {
        aws.config.update({
            region: 'ap-southeast-2',
            accessKeyId: config.AWS_ACCESS_KEY,
            secretAccessKey: config.AWS_SECRET_ACCESS_KEY
        });
    } else {
        aws.config.update({
            region: 'ap-southeast-2'
        });
    }
    S3 = new aws.S3();
};

exports.createDirectories = function(datasets) {
    // create input and output directories to store intermediate files
    if( localStorage ) {
        ['data', 'data/input', 'data/output', 'data/output/public'].forEach(function(dir){
            fs.existsSync(dir) || fs.mkdirSync(dir);
        });
        datasets.forEach(function(dataset){
            fs.existsSync('data/input/'+dataset.category) || fs.mkdirSync('data/input/'+dataset.category);
        });
    }
};

exports.createDirectoriesForFile = function(file) {
    var path = null;
    file.split(/\//).forEach(function(dir){
        if(path) {
            fs.existsSync(path) || fs.mkdirSync(path);
        }
        path = (path ? path + '/' : '') + dir;
    });
};

exports.issueOSOMRequest = function(cb, config, feed, storeTo) {
    var username = config.OSOM_USR,
        password = config.OSOM_PWD,
        nonce = 'aLlutHiSvWEwMakExAySurEzCovEnANt',
        timestamp = moment.tz('Australia/Melbourne').format('DD/MM/YYYYTHH:mm:ss.000'),
        authStr = nonce + timestamp + username + password,
        digest = new Hashes.SHA1().b64(authStr);

    var url = config.OSOM_ENDPOINT+ '/wpp/Show?output=json' + '&pageId=' + feed + '&tm=' + encodeURIComponent(timestamp) + '&username=' + username + '&digest=' + encodeURIComponent(digest);
    return exports.issueJSONRequest(cb, url, storeTo);
};

exports.issueXMLRequest = function(cb, requestUrl, storeTo, options) {
    var parser = function(data, pcb) {
        data = data.replace(/&([^a-zA-Z0-9\#])/g, '&amp;$1');
        data = data.replace(/&([^a-zA-Z0-9\#])/g, '&amp;$1');
        xml2js.parseString(data,pcb);
    };
    resilientRequest(cb, storeTo, parser, function(cb2){
        issueRequest(cb2, requestUrl, storeTo, options, parser);
    });
};

exports.issueJSONRequest = function(cb, requestUrl, storeTo, options) {
    var parser = function(data,cb2){
        if( data === null || data === '') {
            return cb2(null,null);
        }
        return cb2(null, JSON.parse(data));
    };
    resilientRequest(cb, storeTo, parser, function(cb2){
        issueRequest(cb2, requestUrl, storeTo, options, parser);
    });
};

var resilientRequest = function(cb, storeTo, parser, request) {
    var cache = {
        Bucket: cacheBucket,
        Key: 'cache/'+storeTo
    };
    request(function(err,res,raw){
        if( cache.Bucket.match(/^file\:/) ) {
            cb(err,res);
        } else if( err ) {
            // recover from an error by parsing the cached data
            // note, valid for raw==='' if 404...
            log.warn('Fetching cached results from '+cacheBucket+'/cache/'+storeTo);
            S3.getObject(cache, function(err2, data) {
                if( err2 ) {
                    // got an unrecoverable error...
                    cb(err, null);
                } else {
                    if( !data || data==='' ) {
                        cb(null, null);
                    } else {
                        var dataBody = data.Body.toString();
                        if( dataBody === '' ) {
                            cb(null, null);
                        } else {
                            try {
                                parser(dataBody, function(err,finalResult){
                                    if(err) {
                                        cb(err, null);
                                    } else {
                                        if( finalResult ) {
                                            finalResult.CACHED_RESULT = true;
                                        }
                                        cb(null, finalResult);
                                    }
                                });
                            } catch (err2) {
                                cb(err, null);
                            }
                        }
                    }
                }
            });
        } else {
            // stash the successful result for the future
            // note, valid for raw==='' if 404...
            cache.Body = raw || '';
            S3.putObject(cache, function(err, data) {
                // we're just going to ignore errors caching the old data
                if( err ) {
                    log.warn('Error when caching results to '+storeTo+': '+err);
                }
                cb(null, res);
            });
        }
    });
};

function fileRequest(opts, responseHandler) {
    var events = [];
    var response = {
        statusCode: 200,
        setEncoding: function(){},
        on: function(ev,cb){
            events[ev] = cb;
        }
    };

    responseHandler(response);
    fs.readFile('.'+opts.pathname, function (err, data) {
        if (err) {
            events.error && events.error(err);
        } else {
            events.data && events.data(data);
            events.end && events.end();
        }
    });

    return {
        on: function(){},
        end:function(){}
    };
}

function ftpRequest(opts, responseHandler) {
    var Ftp = new jsftp({
        host: opts.hostname,
        timeout: 5 * 1000
    });

    Ftp.get( opts.path, function(err, socket) {
        if (err) {
            var response = {
                    statusCode: 404,
                    socket: {destroy: function(){
                                Ftp.raw.quit(function(err, data) {});
                            }}
            };

            responseHandler(response);
            return;
        };

        socket.resume();
        socket.destroy = function() {
            Ftp.raw.quit(function(err, data) {});
        };

        responseHandler(socket);
    });

    return Ftp;
}

var issueRequest = function(cb, requestUrl, storeTo, options, parser) {
    cb = once(cb); // ensure that the callback is only called once, regardless
    var logurl = requestUrl;
    if( logurl.indexOf('?')>=0 ) {
        logurl = logurl.substring(0,logurl.indexOf('?'));
    }

    options = options||{};
    localStorage && fs.existsSync('data/input/'+storeTo) && fs.unlinkSync('data/input/'+storeTo);

    var requestOptions = url.parse(requestUrl);
    requestOptions.rejectUnauthorized = false;
    requestOptions.headers = {
        'Accept-Encoding': 'gzip'
    };

    requestOptions.storeTo = storeTo;

    var file = { request: fileRequest };
    var ftp1 = { request: ftpRequest };

    var protocol = requestUrl.indexOf('https') === 0 ? (https) : (requestUrl.indexOf('file') === 0 ? (file) : (requestUrl.indexOf('ftp') === 0 ? (ftp1) : (http)));
    var req = protocol.request(requestOptions, function(response) {
        if( (response.statusCode === 404) || (response.statusCode === 403) ) {
            if( options.ignore404 ) {
                log.info('No data received (404) from: '+logurl);
                cb(null, null, '');
            } else {
                log.warn('No data received (404) from: '+logurl);
                cb({
                    'code':response.statusCode,
                    'msg': http.STATUS_CODES[response.statusCode]
                }, null);
            }

            response.socket.destroy();
            return;
        }

        var decodedResponse = response,
            data = '';

        // decode the response if it is transferred as gzip'ed
        if( response.headers && response.headers['content-encoding'] === 'gzip' ) {
            decodedResponse = zlib.createGunzip();
            response.pipe(decodedResponse);
        }

        decodedResponse.on('error', function(e) {
            log.warn('Caught during response: '+e.message);
            cb(e, null);
        });

        decodedResponse.on('data', function (chunk) {
            data += chunk.toString('utf-8');
        });

        decodedResponse.on('end', function() {
            try {
                localStorage && fs.writeFileSync('data/input/'+storeTo, data);
                if(decodedResponse.destroy) {
                    response.destroy();
                }
                try {
                    parser(data, function(err,out){
                        if(err) {
                            log.warn("Response from " + logurl + " was not a valid response.\n" + err.message);
                        } else {
                            log.info("Response from " + logurl + " completed");
                        }
                        cb(err, out, data);
                    });
                } catch (err) {
                    log.warn("Response from " + logurl + " was not a valid response.\n" + err.message);
                    cb(err, null);
                }
            } catch (err) {
                log.warn("Response from " + logurl + " was not received correctly.\n" + err.message);
                cb(err, null);
            }
        })
    });
    req.on('error', function(e) {
        log.warn("Error during request from: " + logurl+': '+e.message);
        cb(e,null);
    });
    req.on('socket', function (socket) {
        socket.setTimeout(1000 * 45);  // 45s timeout
        socket.on('error', function (e) {
            log.warn("Socket error during request from: " + logurl+': '+e.message);
            cb(e,null);
        });
        socket.on('timeout', function() {
            log.warn("Timeout during request from:", logurl);
            req.abort();
            cb(new Error('Timeout during request from: '+logurl),null);
        });
    });
    if(req.end) {
        req.end();
    }
};

exports.storeResult = function(title, s3config, cb) {
    if( s3config.Bucket.indexOf('file://')===0 ) {
        // write to a local file instead...
        exports.createDirectoriesForFile(s3config.Key);
        fs.writeFileSync(s3config.Key, s3config.Body);
        log.info('Successfully updated localhost - '+title);
        cb(null,'Wrote to local file: '+s3config.Key);
        return;
    }
    if( localStorage ) {
        exports.createDirectoriesForFile('data/output/'+s3config.Key);
        fs.writeFileSync('data/output/'+s3config.Key, s3config.Body);
    }
    s3config.Metadata = {
        "lastUpdated": new Date().toISOString()
    };
    if( s3config.ContentEncoding && s3config.ContentEncoding === 'gzip' ) {
        zlib.gzip(s3config.Body, function(err, data){
            if (err) return cb(err, null);
            s3config.Body = data;
            S3.putObject(s3config, function(err, data) {
                if (err) return cb(err, null);
                log.info('Successfully updated S3 - '+title);
                return cb(null, data);
            });
        });
    } else {
        S3.putObject(s3config, function(err, data) {
            if (err) return cb(err, null);
            log.info('Successfully updated S3 - '+title);
            return cb(null, data);
        });
    }
};
