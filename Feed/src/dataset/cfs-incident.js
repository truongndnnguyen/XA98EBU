var transfer = require('../transfer'),
    util = require('../util');

// create input and output directories to store intermediate files
exports.name = 'cfs-incident';
exports.description = 'SA Country Fire Service incidents and warnings';
exports.category = 'cfs';
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
    transfer.issueXMLRequest(cb, config.CFS_INCIDENT_ENDPOINT, exports.category+'/'+exports.name+'.xml');
};

function getSingleValue(obj, val) {
    if( obj[val] && obj[val].length ) {
        return obj[val][0];
    }
    return null;
}

function decodeStyle(url) {
    if( url === null ) {
        return null;
    }
    var style = {};

    if( url.indexOf('Icon') >= 0 ) {
        url = url.substring(1,url.indexOf('Icon')); // strip leading # and trailing Icon
    }

    ['Safe', 'Open', 'Closed'].forEach(function(match) {
        if( url.indexOf(match) >= 0 ) {
            url = url.substring(0,url.lastIndexOf(match));
            style.status = match;
        }
    });

    var mappings = {
        'BurnOff': ['Fire', 'Planned Burn'],
        'Fire': ['Fire', 'Fire'],
        'Other': ['Other', 'Other'],
        'Flood': ['Flooding', 'Flooding'],
        'Gas': ['Hazardous Material', 'Gas Leaks'],
        'Hazmat': ['Hazardous Material', 'Hazardous Material'],
        'Marine': ['Accident / Rescue','Ship'],
        'Air': ['Accident / Rescue','Aircraft'],
        'Structure': ['Fire', 'Building Fire'],
        'Earthquake': ['Earthquake','Earthquake'],
        'Thunder': ['Weather', 'Thunderstorm'],
        'Vehicle': ['Accident / Rescue', 'Road Accident']
    };

    if( mappings[url] ) {
        style.category1 = mappings[url][0];
        style.category2 = mappings[url][1];
    } else {
        style.category1 = url;
        style.category2 = url;
    }

    return style;
}

// transform ses warning feed to geojson
exports.transform = function(data) {
    var placemarks = [];
    if( data && data.kml && data.kml.Document && data.kml.Document.length && data.kml.Document[0].Folder &&
        data.kml.Document[0].Folder.length && data.kml.Document[0].Folder[0].Placemark &&
        data.kml.Document[0].Folder[0].Placemark.length ) {
        placemarks = data.kml.Document[0].Folder[0].Placemark;
    }
    var geojson = placemarks.map(function(placemark) {
        var point = getSingleValue(placemark,'Point'),
            style = decodeStyle(getSingleValue(placemark,'styleUrl')),
            status = style ? style.status : null,
            webBody = getSingleValue(placemark,'description'),
            created = null;

        if( !point ) {
            return;
        }

        var coordinates = getSingleValue(point,'coordinates');
        var latlng = coordinates.split(',');
        var geom = {
            'type': 'Point',
            'coordinates': [latlng[0], latlng[1]]
        };

        //attempt to parse html for incident status
        if( webBody && webBody.indexOf('Status:')>=0 ) {
            // &gt;Status: COMPLETE&lt;
            var m = webBody.match(/Status:\s+([a-zA-Z0-9 ]+)/);
            if( m.length >= 2 ) {
                status = m[1];
            }
        }

        if( status === 'SAFE' ) {
            // suppress safe incidents
            return;
        }

        // attempt to parse html for creation datestamp
        if( webBody && webBody.indexOf('First Reported:')>=0 ) {
            // &gt;First Reported: Thursday, 08 Oct 2015 08:25:00&lt;
            var m = webBody.match(/First Reported:\s+([a-zA-Z0-9\,\: ]+)/);
            if( m.length >= 2 ) {
                created = util.parseDate(m[1], ['dddd, DD MMM YYYY hh:mm:ss']);
            }
        }

        return {
            'type': 'Feature',
            'geometry': geom,
            'properties': {
                'feedType': 'incident',
                'id': coordinates,
                'category1': style ? style.category1 : null,
                'category2': style ? style.category2 : null,
                'status': status,
                'name': getSingleValue(placemark,'name'),
                'location': getSingleValue(placemark,'name'),
                'created': created,
                'updated': null,
                'url': 'http://www.cfs.sa.gov.au/site/warnings_and_incidents.jsp'
                // 'webBody': webBody
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
