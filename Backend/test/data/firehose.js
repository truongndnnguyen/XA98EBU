var db = require('../../src/postgresql'),
    fs = require('fs'),
    async = require('async');

function findFeature(feature, cb) {
    var id = [feature.properties.category1,feature.properties.category2,feature.properties.id].join('/');
    return db.notifyableUsers(feature.geometry, function(err,data) {
        if(err) {
            if( err.code && err.code === 'ECONNRESET' ) {
                console.log(err);
            } else {
                console.log(JSON.stringify(feature.geometry,null,'  '));
                console.log(err);
            }
            return cb(null,null);
        }
        console.log('Matched',id,'and found',data.rows[0].matches,'matches');
        cb(null,data);
    });
}

var osom = JSON.parse(fs.readFileSync('osom-geojson.json'));
async.each(osom.features.slice(0,50), function(feature,cb){
    findFeature(feature, cb);
}, function(){
    db.close();
});
// osom.features.forEach(function(feature){
//     findFeature(feature, function(err,data){
//     });
// });
