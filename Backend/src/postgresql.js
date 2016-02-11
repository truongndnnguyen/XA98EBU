var pg = require('pg'),
    async = require('async');
//    config = require('./config.json');

pg.defaults.poolSize = 100;

//var PG_URL = config.POSTGRESQL_URL || 'postgres://em_public_master:3m_publ1c_l0g1n@em-public-dev.c2o6ycgwtp5h.ap-northeast-1.rds.amazonaws.com:5432/em_public_dev';

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
    pwresetValidationCode: 'pwreset_validation_code',
    enableNotification: 'enabled_notifications'
};
var USER_MODEL_FIELDS = ['userid:S', 'password:S', 'firstname:S', 'lastname:S', 'tocVersion:S', 'email:S', 'emailChangingTo:S',
    'emailValidationCode:S', 'pwresetValidationCode:S', 'enableNotification:B', 'watchZones:LWZ'];

var WZ_MODEL_TO_DB_MAPPING = {
    id: 'id',
    userid: 'userid',
    latitude: 'latitude',
    longitude: 'longitude',
    radius: 'radius',
    name: 'name',
    enableNotification: 'enabled_notifications'
};
var WZ_MODEL_FIELDS = ['id:P', 'latitude:D','longitude:D','radius:D','name:S', 'enableNotification:B'];

var WZF_MODEL_TO_DB_MAPPING = {
    id: 'id',
    watchzoneid: 'watchzoneid',
    name: 'name'
};
var WZF_MODEL_FIELDS = ['name:S'];

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

            if( fieldType === 'P' ) {
                userData[fieldName] = item[dbName] ? item[dbName] : '';
            } else if( fieldType === 'S' ) {
                userData[fieldName] = item[dbName] ? item[dbName] : '';
            } else if( fieldType === 'D' ) {
                userData[fieldName] = item[dbName] ? item[dbName] : '';
            } else if( fieldType === 'B' ) {
                  userData[fieldName] = item[dbName] ? true : false;
            } else if( fieldType === 'LWZ' ) { // list of watch zones
                // userData[fieldName] = dynamoWatchZonesToModel(item[fieldName]);
            }
        }
    });
    return userData;
}
function dbToWatchZoneFilterModel(item) {
    return dbToModel(item, WZF_MODEL_FIELDS, WZF_MODEL_TO_DB_MAPPING);
}

function dbToUserModel(item) {
    return dbToModel(item, USER_MODEL_FIELDS, USER_MODEL_TO_DB_MAPPING);
}

function dbToWatchZoneModel(item) {
    return dbToModel(item, WZ_MODEL_FIELDS, WZ_MODEL_TO_DB_MAPPING);
}

function query(sql, values, connectionString, cb) {
    //console.log('QUERY:', sql, " values ", JSON.stringify(values,null,'  '));

    pg.connect(connectionString, function(err, client, done) {
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

function asyncCreateWatchZoneRecords(userModel, connectionString) {
    var ops = [];
    var hasNotificationWZ = false;
    //ops will be returned as a array to be used in an async.series.
    if( userModel.watchZones ) {
        userModel.watchZones.map(function (wz) {
            if (wz.enableNotification) {
                hasNotificationWZ = true;
            }
            ops.push(function(cb){

                var clauses = [], placeholders = [], params = [];
                iterateModel(wz, WZ_MODEL_FIELDS, function (field, fieldType, value) {
                    if(fieldType !=='P'){
                        if( fieldType === 'S' || fieldType === 'B') {
                            params.push(value);
                        } else if( fieldType === 'D' ) {
                            params.push(parseFloat(''+value));
                        }
                        clauses.push(WZ_MODEL_TO_DB_MAPPING[field]);
                        placeholders.push('$'+params.length);
                    }
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


                var sql = 'insert into em_public_watchzone('+clauses.join(',')+') values('+placeholders.join(',')+') returning id';

                //need to create nested watchzone filters, need to pass in wz and cb
                // (cb is the callback for the asyc.series(ops) call from updateuser).
                query(sql, params, connectionString, createWatchzoneFilters.bind({wz: wz, cb: cb, connectionString: connectionString}));

            });
        });
    }
    //re-enable notification if user update any wz to on.
    if (hasNotificationWZ) {
        ops.push(function (cb) {
            var updateUserSql = 'UPDATE em_public_user SET enabled_notifications= true WHERE  id = $1';
            query(updateUserSql, [userModel.userid], connectionString, cb);
        });
    }
    return ops;
}

function createWatchzoneFilters(err, data)
{
  //get newly inserted watchzone_id;
  if(data && data.rows && data.rows.length) {
    var watchzoneid = data.rows[0].id;
    var  watchzone = this.wz;

    var connectionString = this.connectionString;
    watchzone.id = watchzoneid;

    seriesOps = [];

    if (watchzone.filters && watchzone.filters.map) {
        watchzone.filters.map(
          function (filter) {
              seriesOps.push(function (callback) {
                  var filterName = filter.feedType + ";" + filter.classification
                  var params = [];

                  filterName = filterName.toLowerCase().replace(/\s+/g, '');

                  var sql = 'insert into em_public_watchzone_filter(watchzoneid, name) values($1, $2)';
                  params.push(watchzoneid);
                  params.push(filterName);

                  query(sql, params, connectionString, callback);
              });
          });
    }

    async.series(seriesOps,
        function(err){
            this.cb();
        }.bind({cb: this.cb})
    );
  }
}

exports.unsubscribeUser = function (user, updated, connectionString, cb) {
    var sql = 'update em_public_watchzone ' +
              'set enabled_notifications = false , disable_notification_date=$2' +
              'where userid= $1 '

    return query(sql, [user.userid, updated], connectionString, function (err, data) {
        //update user notification flag
        if (err) {
            cb(err);
        }
        else {
            var sql = 'update em_public_user ' +
            'set enabled_notifications = false ' +
            'where id= $1 ';

            return query(sql, [user.userid], connectionString, cb)
        }
    });

}

exports.notifyableUsers = function(geometry, properties, classification, connectionString, cb) {
    var clauses = [], params = [], sql = "";

    iterateGeometries(geometry, function(geom) {
        params.push(JSON.stringify(geom));
        //clauses.push('ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326)::geography, the_geom)');
        clauses.push('ST_DWithin(geography(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326), 4326)),' +
                                'geography(ST_Transform(st_setsrid(st_point(longitude,latitude),4326),4326)),radius, false)');
    });

    filter = 'warning;'+classification;
    params.push(filter);

    sql = "SELECT PMUSER.id as userid, PMUSER.email, PMUSER.firstname, PMUSER.lastname, string_agg(WZ.name, ', ') as name " +
          "FROM em_public_user PMUSER, " +
          "em_public_watchzone WZ, " +
          "(SELECT * FROM em_public_watchzone_filter WHERE name = $"+params.length+") WZF " +
          "WHERE PMUSER.id = WZ.userid " +
          "AND WZ.id = WZF.watchzoneid " +
          "AND PMUser.enabled_notifications = true " +
          "AND WZ.enabled_notifications = true " +
          "AND ("+ clauses.join(" OR ") +") " +
          "GROUP BY PMUSER.id, PMUSER.email, PMUSER.firstname, PMUSER.lastname, PMUSER.email";


          console.log("sql: ", sql, " params: ", params);
    return query(sql,
        params, connectionString, cb);
};

exports.deleteUserRecord = function(val, connectionString, masterCB) {
    var ops = [
        function(cb){
            var field = USER_MODEL_TO_DB_MAPPING['userid'];
            return query('delete from em_public_user where '+field+' = $1', [val], connectionString, cb);
        },
        function(cb){
            var field = WZ_MODEL_TO_DB_MAPPING['userid'];
            return query('delete from em_public_watchzone where userid = $1', [val], connectionString, cb);
        }
    ];
    async.parallel(ops, masterCB);
};

exports.findUserByKey = function(keyname, keyvalue, connectionString, cb) {
    var field = USER_MODEL_TO_DB_MAPPING[keyname],
        val = keyvalue.toLowerCase();
    return query('select * from em_public_user where '+field+' = $1', [val], connectionString, function(err,data){
        if(err) {
            return cb(err);
        }
        if( !data || !data.rows || !data.rows.length ) {
            return cb(null,null);
        }
        var userModel = dbToUserModel(data.rows[0]);

        return query('select * from em_public_watchzone where userid = $1', [userModel.userid], connectionString, function(err,data){
            if( err ) {
                cb(err);
            }
            userModel.watchZones = [];

            if( data && data.rows && data.rows.length) {
                userModel.watchZones = data.rows.map(function(row){
                  var watchzone = dbToWatchZoneModel(row);
                  watchzone.filters = [];
                  return watchzone;
                });
            }

            seriesOps = [];
            userModel.watchZones.map(
              function(watchzone) {
                seriesOps.push(function(callback){
                  var filterQuery = "select * from em_public_watchzone_filter where watchzoneid = $1";

                  //select watchzones, then during callback select that watchzones filters
                  query(filterQuery, [watchzone.id], connectionString, mapWatchzoneFilters.bind({wz: watchzone, callback: callback}))
                });
              });

            async.series(seriesOps,
                function(err){
                    return cb(null, userModel);
            });
        });


    });
};

function mapWatchzoneFilters(err, data)
{
  var wzFilters = [];
  if(data && data.rows && data.rows.length) {
    wzFilters = data.rows.map(function(row){
        var wzf = dbToWatchZoneFilterModel(row)
        var splitWzf = wzf.name.split(";");

        var filterObject = {
          feedType: splitWzf[0],
          classification: splitWzf[1]
        }
        return(filterObject);
    });

    this.wz.filters = wzFilters;
  }
    this.callback();
}

exports.updateUserRecord = function(userModel, connectionString, masterCB) {

    var ops = [
        function(cb){
            var clauses = [], params = [];
            iterateModel(userModel, USER_MODEL_FIELDS, function(field, fieldType, value) {
                if( fieldType === 'S' || fieldType === 'B' ) {
                    params.push(value);
                    clauses.push(USER_MODEL_TO_DB_MAPPING[field] + ' = $'+params.length);
                }
            });
            var pkey = USER_MODEL_TO_DB_MAPPING['userid'],
                pvalue = userModel.userid;

            params.push(pvalue);
            var sql = 'update em_public_user set '+clauses.join(',')+' where '+pkey+' = $'+params.length;

            return query(sql, params, connectionString, cb);
        },
        function(cb){
            return query('delete from em_public_watchzone where userid = $1', [userModel.userid], connectionString, cb);
        }
    ].concat(asyncCreateWatchZoneRecords(userModel, connectionString));
    async.series(ops, masterCB);
};

exports.createUserRecord = function(userModel, connectionString, masterCB) {
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
            return query(sql, params, connectionString, cb);
        }
    ].concat(asyncCreateWatchZoneRecords(userModel, connectionString));
    async.parallel(ops, masterCB);
};

exports.disableEmailsForUser = function(email, validationCode, connectionString, callback) {
    var params = [];
    params.push(email)
    params.push(validationCode)
    params.push(email)
    var sql = 'update em_public_user SET enabled_notifications = false, email = NULL, email_changing_to = $1, email_validation_code = $2  WHERE email = $3';
    
    console.log(sql, params);
    return query(sql, params, connectionString, callback);
};


