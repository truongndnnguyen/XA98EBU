var pg = require('pg'),
    fs = require('fs'),
    turf_buffer = require('turf-buffer'),
    async = require('async');

var PG_URL='postgres://VINE:V1N3staging@geoserver-rds-prerelease-07may2015.cpvpaawdox1v.ap-southeast-2.rds.amazonaws.com:5432/EM_Maps';

/**
ST_astext(ST_Transform(geometry(ST_Buffer(geography(ST_Transform( st_setsrid(st_point(longitude,latitude),4326), 4326 )),radius)),4326)) ;
*/

// model translation

function query(sql, values, cb) {
    console.log('QUERY:', sql, JSON.stringify(values,null,'  '));
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

function fetchAsGeoJSON(cb) {
    query('select id, watchzone_name, radius, latitude, longitude, st_asgeojson(the_geom) as geojson from fireready_watchzones_poly limit 1000',[], function(err,data){
        if(err) return cb(err);
        console.log('fetched data, transforming');
        cb(null, {
            type: 'FeatureCollection',
            features: data.rows.map(function(row){
                return {
                    geometry: JSON.parse(row.geojson),
                    properties: {
                        userid: row.id,
                        name: row.watchzone_name
                    }
                };
            })
        });
    });
}

function fetchAsPrimative(cb) {
    query('select id, watchzone_name, radius, latitude, longitude from fireready_watchzones_poly',[], function(err,data){
        if(err) return cb(err);
        console.log('fetched data, transforming');
        cb(null, {
            type: 'FeatureCollection',
            features: data.rows.map(function(row){
                return {
                    geometry: {
                        type: 'Point',
                        coordinates: [row.longitude, row.latitude]
                    },
                    properties: {
                        userid: row.id,
                        name: row.watchzone_name,
                        radius: row.radius
                    }
                };
            })
        });
    });
}

function fetchAndBuffer(cb) {
    fetchAsPrimative(function(err,data){
        if(err) return cb(err);
        console.log('transformed data, buffering');
        cb(null, {
            type: 'FeatureCollection',
            features: data.features.map(function(feature){
                return {
                    geometry: turf_buffer(feature.geometry, feature.properties.radius, 'meters').geometry,
                    properties: feature.properties
                };
            })
        });
    });
}

fetchAsPrimative(function(err,data){
// fetchAndBuffer(function(err,data){
    if(err) {
        console.log('error',err);
        return;
    }
    console.log('transformed data, writing');
    fs.writeFileSync('wz-geojson.json', JSON.stringify(data));
});
