var transfer = require('../transfer'),
    util = require('../util');

// create input and output directories to store intermediate files
exports.name = 'ga-earthquake';
exports.description = 'Geoscience Australia earthquakes feed';
exports.category = 'ga';
exports.feeds = {
    // s3: {
    //     Key: 'ga-earthquake-geojson.json',
    //     ContentType: 'application/json',
    //     Body: ''
    // },
    statusPage: true,
    firehose: true,
    localview: true,
    textonly: true,
    interstate: true,
    cap: false
};
exports.features = [];

exports.issueRequest = function(config, cb) {
    transfer.issueXMLRequest(cb, config.GA_EARTHQUAKE_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

function getSingleValue(obj, val) {
    if( obj[val] && obj[val].length ) {
        return obj[val][0];
    }
    return null;
}

function findParameterValue(obj, name) {
    if( obj.parameter.length ) {
        var param = obj.parameter.filter(function(p){
            return p.valueName[0] === name;
        });
        return param[0].value[0];
    }
    return null;
}

// transform ses warning feed to geojson
exports.transform = function(data) {
    var entryMap = {};
    data.feed.entry.forEach(function(entry){
        var summary = getSingleValue(entry,'summary'),
            alert = summary ? getSingleValue(summary,'alert') : null,
            identifier = alert ? getSingleValue(alert, 'identifier') : null;
        if( identifier ) {
            entryMap[identifier] = entry;
        }
    });

    var geojson = Object.keys(entryMap).map(function (key) {
        var a = entryMap[key],
            summary = getSingleValue(a,'summary'),
            alert = summary ? getSingleValue(summary,'alert') : null,
            info = alert ? getSingleValue(alert,'info') : null,
            area = info ? getSingleValue(info,'area') : null,
            circle = area ? getSingleValue(area, 'circle') : null,
            msgType = alert ? getSingleValue(alert,'msgType') : null,
            onset = getSingleValue(info,'onset'),
            location = getSingleValue(area,'areaDesc'),
            description = getSingleValue(info,'description');

        if( !info ) {
            return;
        } else if( msgType && (msgType === 'Cancel') ) {
            return;
        } else if( (Date.now() - Date.parse(onset)) > 24*60*60*1000 ) {
            return;
        }

        var geom = [];
        if( circle ) {
            var parts = circle.split(' ');
            var coords = parts[0].split(',');
            geom = {
                'type': 'Point',
                'coordinates': [coords[1], coords[0]]
            };
        }

        if( !location && description ) {
            var match = description.match(/earthquake has occurred in \"(.+)\" at a depth/);
            if( match && match.length >= 2 ) {
                location = match[1];
            }
        }

        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': {
                'feedType': 'earthquake',
                'id': getSingleValue(alert, 'id'),
                'category1': getSingleValue(info,'event'),
                'category2': getSingleValue(info,'event'),
                'status': getSingleValue(info,'severity'),
                'name': getSingleValue(info,'headline'),
                'created': onset,
                'updated': getSingleValue(summary,'updated'),
                'webBody': description,
                'url': getSingleValue(info,'web'),
                'cssClass': 'earthquake',
                'magnitude': findParameterValue(info, 'Magnitude'),
                'location': location
            }
        };
    }).filter(function(a) {
        return a !== undefined;
    });
    if( exports.feeds.s3 ) {
        exports.feeds.s3.Body = JSON.stringify({
            "type": "FeatureCollection",
            "features": geojson
        });
    }
    exports.features = geojson;
};
