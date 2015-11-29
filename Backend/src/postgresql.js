var pg = require('pg');

var PG_URL='postgres://VINE:V1N3staging@geoserver-rds-prerelease-07may2015.cpvpaawdox1v.ap-southeast-2.rds.amazonaws.com:5432/EM_Maps';

function query(sql, values, cb) {
    var client = new pg.Client(PG_URL);
    client.connect(function(err) {
        if(err) {
            return cb(err);
        }
        client.query(sql, values, function(err, result) {
            client.end();
            cb(err, result);
        });
    });
}

function iterateGeometries(geom, cb) {
    if( geom.type === 'GeometryCollection') {
        geom.geometries.forEach(function(subgeom){
            return iterateGeometries(subgeom, cb);
        });
    } else {
        cb(geom);
    }
}

exports.notifyableUsers = function(geometry, cb) {
    var clauses = [], params = [];
    iterateGeometries(geometry, function(geom) {
        params.push(JSON.stringify(geom));
        clauses.push('ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326), the_geom)');
    });

    return query('select device_id, watchzone_name from fireready_watchzones_poly where '+clauses.join(' OR '),
        params, function(err,data){
        cb(err, data); // data is already in the appropriate format...
    });
};
