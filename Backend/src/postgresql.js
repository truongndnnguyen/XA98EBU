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

function query(sql, values, cb) {
    //console.log('QUERY:', sql, JSON.stringify(values,null,'  '));

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
    //ops will be returned as a array to be used in an async.series.

    if( userModel.watchZones ) {
        userModel.watchZones.map(function(wz){
            ops.push(function(cb){

                var clauses = [], placeholders = [], params = [];
                iterateModel(wz, WZ_MODEL_FIELDS, function(field, fieldType, value) {
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

                query(sql, params, createWatchzoneFilters.bind({wz: wz, cb: cb}));

            });
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

    watchzone.id = watchzoneid;

    seriesOps = [];

    if (watchzone.filters && watchzone.filters.map) {
        watchzone.filters.map(
          function (filter) {
              seriesOps.push(function (callback) {
                  var filterName = filter.feedType + ";" + filter.category1 + ";" + filter.category2;
                  var params = [];

                  filterName = filterName.toLowerCase().replace(/\s+/g, '');

                  var sql = 'insert into em_public_watchzone_filter(watchzoneid, name) values($1, $2)';
                  params.push(watchzoneid);
                  params.push(filterName);

                  query(sql, params, callback);
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

exports.notifyableUsers = function(geometry, properties,cb) {
    var clauses = [], params = [], sql = "";

    iterateGeometries(geometry, function(geom) {
        params.push(JSON.stringify(geom));
        //clauses.push('ST_Intersects(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326)::geography, the_geom)');
        clauses.push('ST_DWithin(geography(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($'+params.length+'), 4326), 4326)),' +
                                'geography(ST_Transform(st_setsrid(st_point(longitude,latitude),4326),4326)),radius, false)');
    });

    if(properties.feedType === 'warning')
    {
        //console.log("warning - no filter");
        //If warning then no filter will apply so one less join between tables.
        sql = 'SELECT PMUSER.id as userid, PMUSER.email, WZ.name ' +
              'FROM em_public_user PMUSER, ' +
              'em_public_watchzone WZ ' +
              'WHERE PMUSER.id = WZ.userid ' +
              'AND PMUser.enabled_notifications = true ' +
              'AND WZ.enabled_notifications = true ' +
              'AND ('+clauses.join(' OR ')+')';

    }
    else
    {
        //console.log("not warning - check filter");
        var filtercat2 = properties.feedType + ";" + properties.category1 + ";" + properties.category2;
        filtercat2 = filtercat2.toLowerCase().replace(/\s+/g, '');
        var filtercat1 = properties.feedType + ";" + properties.category1 + ";all"
        filtercat1 = filtercat1.toLowerCase().replace(/\s+/g, '');

        //console.log("filter : ", filtercat1, " " , filtercat2);

        params.push(filtercat1);
        params.push(filtercat2);

        sql = 'SELECT PMUSER.id as userid, PMUSER.email, WZ.name ' +
        'FROM em_public_user PMUSER, ' +
        'em_public_watchzone WZ, ' +
        '(SELECT * FROM em_public_watchzone_filter WHERE name IN ($'+(params.length-1)+',$'+params.length+')) WZF ' +
        'WHERE PMUSER.id = WZ.userid ' +
        'AND WZF.watchzoneid  = WZ.id ' +
        'AND PMUser.enabled_notifications = true ' +
        'AND WZ.enabled_notifications = true ' +
        'AND ('+clauses.join(' OR ')+')';
    }

    return query(sql,
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
                  //console.log(row);
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
                  query(filterQuery, [watchzone.id], mapWatchzoneFilters.bind({wz: watchzone, callback: callback}))
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
          category1: splitWzf[1],
          category2: splitWzf[2]
        }
        return(filterObject);
    });

    this.wz.filters = wzFilters;
  }
    this.callback();
}

exports.updateUserRecord = function(userModel, masterCB) {

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
