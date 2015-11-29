exports.handler = function(endpoint) {
    var method = endpoint.method || 'GET',
        path = endpoint.path || '/',
        responseType = endpoint.responseType || 'application/json',
        handlersrc = endpoint.src;

    return function(req,res,next){
        if( (req.url && req.url === path) && req.method === method ) {
            console.log("[200] " + req.method + " to " + req.url);
            if (req.method === 'POST') {
                var rawpost = '';
                req.on('data', function(chunk) {
                    rawpost += chunk.toString();
                });
                req.on('end', function() {
                    delete require.cache[require.resolve('../build/'+handlersrc)];
                    try {
                        var handler = require('../build/'+handlersrc)
                        handler.handler(JSON.parse(rawpost),{
                            done: function(err,data){
                                if(err) {
                                    console.error(err.stack || err);
                                    res.writeHead(401, 'Server error', {'Content-Type': 'text/html'});
                                    res.end('<html><head><title>401 - Server error</title></head><body><h1>Error</h1>'+err+'</body></html>');
                                } else {
                                    res.writeHead(200, "OK", {'Content-Type': responseType});
                                    res.end(JSON.stringify(data,null,'  ')+'\n');
                                }
                            }
                        });
                    } catch(err) {
                        console.error(err.stack || err);
                        res.writeHead(401, 'Server error', {'Content-Type': 'text/html'});
                        res.end('<html><head><title>401 - Server error</title></head><body><h1>Error</h1>'+err+'</body></html>');
                    }
                });
            } else if( req.method === 'GET' ) {
                delete require.cache[require.resolve('../build/'+handlersrc)];
                try {
                    var handler = require('../build/'+handlersrc)
                    handler.handler(null,{
                        done: function(err,data){
                            if(err) {
                                console.error(err.stack || err);
                                res.writeHead(401, 'Server error', {'Content-Type': 'text/html'});
                                res.end('<html><head><title>401 - Server error</title></head><body><h1>Error</h1>'+err+'</body></html>');
                            } else {
                                res.writeHead(200, "OK", {'Content-Type': responseType});
                                res.end(JSON.stringify(data,null,'  ')+'\n');
                            }
                        }
                    });
                } catch(err) {
                    console.error(err.stack || err);
                    res.writeHead(401, 'Server error', {'Content-Type': 'text/html'});
                    res.end('<html><head><title>401 - Server error</title></head><body><h1>Error</h1>'+err+'</body></html>');
                }
            } else {
                next();
            }
        } else {
            next();
        }
    };
};
