var pg = require('pg'),
    async = require('async'),
    config = require('./config.json');

pg.defaults.poolSize = 100;

var PG_URL = config.POSTGRESQL_URL || 'postgres://em_public_master:3m_publ1c_l0g1n@em-public-dev.c2o6ycgwtp5h.ap-northeast-1.rds.amazonaws.com:5432/em_public_dev';

/**
ST_astext(ST_Transform(geometry(ST_Buffer(geography(ST_Transform( st_setsrid(st_point(longitude,latitude),4326), 4326 )),radius)),4326)) ;
*/

// model translation

var USER_MODEL_TO_DB_MAPPING = {
    userid: 'id',
    password: 'password',
    firstname: 'firstname',
    lastname: 'lastname',
    tocVersion: 'toc_version',
    email: 'email',
    emailChangingTo: 'email_changing_to',
    emailValidationCode: 'email_validation_code',
    pwresetValidationCode: 'pwreset_validation_code'
};
var USER_MODEL_FIELDS = ['userid:S', 'password:S', 'firstname:S', 'lastname:S', 'tocVersion:S', 'email:S', 'emailChangingTo:S',
    'emailValidationCode:S', 'pwresetValidationCode:S', 'watchZones:LWZ'];

var WZ_MODEL_TO_DB_MAPPING = {
    userid: 'userid',
    latitude: 'latitude',
    longitude: 'longitude',
    radius: 'radius',
    name: 'name'
};
var WZ_MODEL_FIELDS = ['latitude:D','longitude:D','radius:D','name:S'];

function iterateModel(item, model, cb) {
    model.forEach(function(key){
        var parse = key.match(/^(.+)\:(.+)$/);
        if( parse ) {
            cb(parse[1], parse[2], item[parse[1]]);
        }
    });
}

function dbToModel(item, modelFields, modelMapping) {
    var userData = {};
    modelFields.forEach(function(key){
        var parse = key.match(/^(.+)\:(.+)$/);
        if( parse ) {
            var fieldName = parse[1],
                fieldType = parse[2],
                dbName = modelMapping[fieldName];

            if( fieldType === 'S' ) {
                userData[fieldName] = item[dbName] ? item[dbName] : '';
            } else if( fieldType === 'D' ) {
                userData[fieldName] = item[dbName] ? item[dbName] : '';
            } else if( fieldType === 'LWZ' ) { // list of watch zones
                // userData[fieldName] = dynamoWatchZonesToModel(item[fieldName]);
            }
        }
    });
    return userData;
}

function dbToUserModel(item) {
    return dbToModel(item, USER_MODEL_FIELDS, USER_MODEL_TO_DB_MAPPING);
}

function dbToWatchZoneModel(item) {
    return dbToModel(item, WZ_MODEL_FIELDS, WZ_MODEL_TO_DB_MAPPING);
}

function query(sql, values, cb) {
    // console.log('QUERY:', sql, JSON.stringify(values,null,'  '));
    pg.connect(PG_URL, function(err, client, done) {
        if(err) {
            return cb(err);
        }
        client.query(sql, values, function(err, result) {
            done();
            cb(err, result);
        });
    });
}

exports.close = function() {
    pg.end();
};

function iterateGeometries(geom, cb) {
    if( geom.type === 'GeometryCollection') {
        geom.geometries.forEach(function(subgeom){
            return iterateGeometries(subgeom, cb);
        });
    } else {
        cb(geom);
    }
}

function asyncCreateWatchZoneRecords(userModel) {
    var ops = [];
    if( userModel.watchZones ) {
        userModel.watchZones.map(function(wz){
            ops.push(function(cb){
                var clauses = [], placeholders = [], params = [];
                iterateModel(wz, WZ_MODEL_FIELDS, function(field, fieldType, value) {
                    if( fieldType === 'S' ) {
                        params.push(value);
                    } else if( fieldType === 'D' ) {
                        params.push(parseFloat(''+value));
                    }
                    clauses.push(WZ_MODEL_TO_DB_MAPPING[field]);
                    placeholders.push('$'+params.length);
                });

                // add the foreign key back to user table
                params.push(userModel.userid);
                clauses.push('userid');
                placeholders.push('$'+params.length);

                // add the_geom field (computed)
                clauses.push('the_geom');
                placeholders.push('ST_Transform(geometry(ST_Buffer(geography(ST_Transform(st_setsrid(st_point('+
                    '$'+(params.length+1)+
                    ',$'+(params.length+2)+
                    '),4326),4326)),'+
                    '$'+(params.length+3)+
                    ')),4326)');
                params.push(wz.longitude);
                params.push(wz.latitude);
                params.push(wz.radius);

                var sql = 'insert into em_public_watchzone('+clauses.join(',')+') values('+placeholders.join(',')+')';
                return query(sql, params, cb);
            });
        });
    }
    return ops;
}

exports.notifyableUsers = function(geometry, cb) {
    var clauses = [], params = [];
    iterateGeometries(geometry, function(geom) {
        params.push(JSON.stringify(geom));
        clauses.push('ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326), the_geom)');
    });

    return query('select email from em_public_user where id in '+
        '(select userid from em_public_watchzone where '+clauses.join(' OR ')+')',
        params, cb);
};

exports.deleteUserRecord = function(val, masterCB) {
    var ops = [
        function(cb){
            var field = USER_MODEL_TO_DB_MAPPING['userid'];
            return query('delete from em_public_user where '+field+' = $1', [val], cb);
        },
        function(cb){
            var field = WZ_MODEL_TO_DB_MAPPING['userid'];
            return query('delete from em_public_watchzone where userid = $1', [val], cb);
        }
    ];
    async.parallel(ops, masterCB);
};

exports.findUserByKey = function(keyname, keyvalue, cb) {
    var field = USER_MODEL_TO_DB_MAPPING[keyname],
        val = keyvalue.toLowerCase();
    return query('select * from em_public_user where '+field+' = $1', [val], function(err,data){
        if(err) {
            return cb(err);
        }
        if( !data || !data.rows || !data.rows.length ) {
            return cb(null,null);
        }
        var userModel = dbToUserModel(data.rows[0]);
        return query('select * from em_public_watchzone where userid = $1', [userModel.userid], function(err,data){
            if( err ) {
                cb(err);
            }
            userModel.watchZones = [];
            if( data && data.rows && data.rows.length) {
                userModel.watchZones = data.rows.map(function(row){
                    return dbToWatchZoneModel(row);
                });
            }
            return cb(null, userModel);
        });
    });
};

exports.updateUserRecord = function(userModel, masterCB) {
    var ops = [
        function(cb){
            var clauses = [], params = [];
            iterateModel(userModel, USER_MODEL_FIELDS, function(field, fieldType, value) {
                if( fieldType === 'S' ) {
                    params.push(value);
                    clauses.push(USER_MODEL_TO_DB_MAPPING[field] + ' = $'+params.length);
                }
            });
            var pkey = USER_MODEL_TO_DB_MAPPING['userid'],
                pvalue = userModel.userid;

            params.push(pvalue);
            var sql = 'update em_public_user set '+clauses.join(',')+' where '+pkey+' = $'+params.length;
            return query(sql, params, cb);
        },
        function(cb){
            return query('delete from em_public_watchzone where userid = $1', [userModel.userid], cb);
        }
    ].concat(asyncCreateWatchZoneRecords(userModel));
    async.series(ops, masterCB);
};

exports.createUserRecord = function(userModel, masterCB) {
    var ops = [
        function(cb){
            var clauses = [], placeholders = [], params = [];
            iterateModel(userModel, USER_MODEL_FIELDS, function(field, fieldType, value) {
                if( fieldType === 'S' ) {
                    params.push(value);
                    clauses.push(USER_MODEL_TO_DB_MAPPING[field]);
                    placeholders.push('$'+params.length);
                }
            });

            var sql = 'insert into em_public_user('+clauses.join(',')+') values('+placeholders.join(',')+')';
            return query(sql, params, cb);
        }
    ].concat(asyncCreateWatchZoneRecords(userModel));
    async.parallel(ops, masterCB);
};
