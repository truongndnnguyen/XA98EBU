'use strict';

var fs = require('fs'),
    sanitize_html = require('sanitize-html'),
    handlebars = require('handlebars'),
    minifier = require('html-minifier'),
    html2txt = require('html-to-text'),
    rules = require('../rules'),
    osom = require('./osom'),
    log = require('../log'),
    util = require('../util'),
    helpers = require('../handlebars-helper'),
    config = {};

exports.name = 'ruleset-cap';

function capifyGeometryPoints(geom, ret) {
    if (geom.type === 'Point') {
        ret.push(geom.coordinates.concat([]).reverse().join(','));
    } else if (geom.type === 'MultiPoint') {
        geom.coordinates.map(function(coords) {
            return coords.concat([]).reverse().join(',');
        }).concat(ret);
    } else if (geom.type === 'GeometryCollection') {
        geom.geometries.map(function(g) {
            capifyGeometryPoints(g, ret);
        });
    }
    return ret;
}

function capifyGeometryPolygons(geom, ret) {
    if (geom.type === 'Polygon') {
        ret.push(geom.coordinates[0].map(function(coord) {
            return coord.concat([]).reverse().join(',');
        }).join(' '));
    } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.map(function(coords) {
            return coords[0].map(function(coord) {
                return coord.concat([]).reverse().join(',');
            }).join(' ');
        }).concat(ret);
    } else if (geom.type === 'GeometryCollection') {
        geom.geometries.map(function(g) {
            capifyGeometryPolygons(g, ret);
        });
    }
    return ret;
}

function capify(e) {
    var cap = e.properties.cap || {},
        overrides = ['category','event','eventCode','responseType','urgency','severity','certainty','instruction','contact','senderName'],
        defaultHeadline = e.properties.category1+' - '+e.properties.category2+' - '+e.classification.location,
        description = defaultHeadline,
        descriptionHTML = description;

    if( e.properties.webBody && e.properties.webBody.indexOf('<')>=0 ) {
        description = html2txt.fromString(e.properties.webBody, {
            wordwrap: 80
        });
        descriptionHTML = sanitize_html(e.properties.webBody);
    } else {
        descriptionHTML = minifier.minify(config.CAP_TEMPLATE(e), {
            removeComments: true,
            collapseWhitespace: true
        });
        description = html2txt.fromString(descriptionHTML, {
            wordwrap: 80
        });
    }

    var propertiesMatch = rules.execute(exports.propertiesRules,
            [e.properties.feedType, e.properties.category1, e.properties.category2, e.properties.status]);
    if( propertiesMatch ) {
        overrides.forEach(function(field){
            cap[field] = cap[field] || propertiesMatch.cap[field];
        });
    }
    e.classification.categories.forEach(function(category) {
        rules.executeMultiMatch(exports.classificationRules, [category, e.classification.iconClass])
        .forEach(function(match){
            overrides.forEach(function(field){
                cap[field] = cap[field] || match.cap[field];
            });
        });
    });

    return {
        identifier: e.classification.deeplinkurl.replace(/[,]/g, '_'),
        status: 'Actual', //this is a real event, not a test
        msgType: 'Alert', // this is the original event, not an update or cancellation
        incidents: e.properties.incidents,
        sent: e.classification.updatedTime,
        rss: {
            description: descriptionHTML
        },
        info: {
            senderName: cap.senderName || 'Emergency Management Victoria',
            contact: cap.contact || 'webmaster@emergency.vic.gov.au',
            category: cap.category,
            event: cap.event,
            eventCode: cap.eventCode,
            effective: e.properties.updated || e.properties.created,
            expires: util.addToDate(e.properties.updated||e.properties.created, 1, 'days'),
            responseType: cap.responseType || 'Monitor',
            urgency: cap.urgency || 'Immediate',
            severity: cap.severity || 'Moderate',
            certainty: cap.certainty || 'Observed',
            headline: e.properties.webHeadline || defaultHeadline,
            description: description,
            instruction: cap.instruction || 'No specific instruction has been issued for this event.',
            web: e.properties.url || config.BASE_URL + 'respond/#!' + e.classification.deeplinkurl,
            area: {
                areaDesc: e.classification.location,
                circles: capifyGeometryPoints(e.geometry, []),
                polygons: capifyGeometryPolygons(e.geometry, [])
            }
        },
        properties: e.properties,
        classification: e.classification
    };
}

exports.configure = function(conf) {
    config.BASE_URL = (conf && conf.EM_PUBLIC_SITE_URL) || 'http://emergency.vic.gov.au/respond/';
    var hbs = fs.readFileSync('config/templates/alert-cap-html.hbs').toString();
    config.CAP_TEMPLATE = handlebars.compile(hbs);
};

exports.classify = function(feature) {
    try {
        feature.classification = osom.classify(feature);
        return capify(feature);
    } catch (err) {
        log.warn('Dropping incident from CAP feed due to exception during classification:', err, JSON.stringify(feature.properties, null, '  '));
        return;
    }
};

/*
category: in :
    <enumeration value="Geo"/>
    <enumeration value="Met"/>
    <enumeration value="Safety"/>
    <enumeration value="Security"/>
    <enumeration value="Rescue"/>
    <enumeration value="Fire"/>
    <enumeration value="Health"/>
    <enumeration value="Env"/>
    <enumeration value="Transport"/>
    <enumeration value="Infra"/>
    <enumeration value="CBRNE"/>
    <enumeration value="Other"/>

event in:
    'Administration', 'Air Quality', 'Animal Health', 'Animal Disease', 'Animal Feed', 'Animal Pest',
    'Animal Quarantine', 'Animal Welfare', 'Aquatic Animal Disease', 'Aquatic Animal Pest', 'Marine Disease',
    'Marine Pest', 'Plague', 'Sheep Grazier Warning', 'Animals', 'Animal Attack', 'Dangerous Animal', 'Aviation',
    'Aircraft Crash', 'Aircraft Incident', 'Airport Closure', 'Airport Lightening Threat', 'Airport Thunder Threat',
    'Airspace Closure', 'Aviation Security', 'Falling Object', 'Notice To Airmen', 'Satellite / Space Re-entry Debris',
    'Civil', 'Building Collapse', 'Civil Emergency', 'Demonstration', 'Public Event', 'Volunteer Request',
    'Criminal Activity', 'Cyber Crime', 'Dangerous Person', 'Terrorism', 'Fire', 'Bushfire', 'Fire Ban',
    'Fire Danger Level', 'Forest Fire', 'Fire Weather', 'Grass Fire', 'Industrial Fire', 'Smoke Alert', 'Structure Fire',
    'Total Fire Ban', 'Flood', 'Dam Failure', 'Flash Flood', 'High Water Level', 'King Tide', 'Levee Failure',
    'Storm Surge', 'Riverine Flood', 'Geological', 'Avalanche', 'Earthquake', 'Karst Hazard', 'Lahar', 'Landslide',
    'Lava Flow', 'Magnetic Storm', 'Meteorite', 'Pyroclastic Flow', 'Pyroclastic Surge', 'Tsunami', 'Volcanic Ash Cloud',
    'Volcano', 'Hazardous Materials', 'Asbestos', 'Biological Hazard', 'Chemical Hazard', 'Explosive Hazard',
    'Major Pollution', 'Radiological Hazard', 'Toxic Plume', 'Health', 'Ambulance', 'Blood Supply',
    'Communicable Disease', 'Drinking Water', 'Drug Safety', 'Drug Supply', 'Food Safety', 'Food Supply',
    'Hospital', 'Human Quarantine', 'Zoonotic Disease', 'Marine', 'Freezing Spray', 'Gale Wind',
    'Hurricane Force Wind', 'Iceberg', 'Large Coastal Surf', 'Large Swell Waves', 'Maritime / Marine Security',
    'Nautical Incident', 'Oil Spill', 'Squall', 'Storm Force Wind', 'Strong Wind', 'Waterspout', 'Missing Person',
    'Missing Vulnerable Person', 'Other Non-Urgent Alerts', 'Other Urgent Alerts', 'Plant Health', 'Plant Disease',
    'Plant Pest', 'Plant Quarantine', 'Preparedness Reminders', 'Emergency Preparedness Reminder', 'Product Safety',
    'Public Services', 'Facility Closure', 'Facility Lockdown', 'Service or Facility', 'Transit', 'Railway',
    'Railway Incident', 'Train / Rail Crash', 'Rescue', 'Distress Beacon', 'Roadway', 'Bridge Closure', 'Bridge Collapse',
    'Hazardous Road Conditions', 'Motor Vehicle Accident', 'Roadway Closure', 'Roadway Delay', 'Roadway Incident',
    'Roadway Usage Condition', 'Traffic Report', 'Search', 'Over Water Search', 'Over Land Search', 'Air Search',
    'Storm', 'Blizzard', 'Dust Storm', 'Hail', 'Rainfall', 'Snowfall', 'Thunderstorm', 'Tornado', 'Tropical Cyclone',
    'Weather', 'Temperature', 'Extreme Heat', 'Frost', 'Wind Chill', 'Test Message', 'Utility', 'Cable Service',
    'Communications Service', 'Diesel Supply', 'Electricity Supply', 'Heating Oil Supply', 'Internet Service',
    'Landline Service', 'Mobile Service', 'Natural Gas Supply', 'Petrol Supply', 'Pipeline Rupture',
    'Satellite Service', 'Sewer System', 'Telephone Service', 'Triple Zero', 'Waste Management', 'Water Supply',
    'Wind', 'Water Quality', 'Wind Change', 'Blue Green Algae'

eventCode in:
    .... externally sourced

responseType in:
    <enumeration value="Shelter"/>
    <enumeration value="Evacuate"/>
    <enumeration value="Prepare"/>
    <enumeration value="Execute"/>
    <enumeration value="Avoid"/>
    <enumeration value="Monitor"/>
    <enumeration value="Assess"/>
    <enumeration value="AllClear"/>
    <enumeration value="None"/>

severity in:
    <enumeration value="Extreme"/>
    <enumeration value="Severe"/>
    <enumeration value="Moderate"/>
    <enumeration value="Minor"/>
    <enumeration value="Unknown"/>
*/

// rule inputs: filterCategory > iconClass
// mapping to: 'category','event','eventCode','responseType','severity'
exports.classificationRules = [
    // basic rules for highlevel mapping Filter -> Category
    { rules: ['Warnings'], cap: {category: 'Safety'} },
    { rules: ['Fire'], cap: {category: 'Fire'} },
    { rules: ['Flood'], cap: {category: 'Env'} },
    { rules: ['Weather'], cap: {category: 'Met'} },
    { rules: ['Health'], cap: {category: 'Health'} },
    { rules: ['Animal/Plant'], cap: {category: 'Env'} },
    { rules: ['Spill/Leak'], cap: {category: 'CBRNE'} },
    { rules: ['Transport'], cap: {category: 'Transport'} },
    { rules: ['Earthquake/Tsunami'], cap: {category: 'Geo'} },
    { rules: ['Other'], cap: {category: 'Other'} },

    { rules: ['Warnings', 'evacuate'], cap: {responseType: 'Evacuate', severity: 'Extreme',
    instruction: 'An evacuation is recommended or procedures are in place to evacuate.'} },
    { rules: ['Warnings', 'emergency'], cap: {responseType: 'Execute', severity: 'Extreme',
    instruction: 'You are in imminent danger and need to take action now. You will be impacted.'} },
    { rules: ['Warnings', 'watchact'], cap: {responseType: 'Prepare', severity: 'Severe',
    instruction: 'An emergency is heading toward you. Conditions are changing and you need to take action now to protect yourself and your family.'} },
    { rules: ['Warnings', 'advice'], cap: {responseType: 'Monitor', severity: 'Moderate',
    instruction: 'An incident is occurring or has occurred in the area. Access information and monitor conditions.'} },
    { rules: ['Warnings', 'community_update'], cap: {responseType: 'None', severity: 'Minor',
    instruction: 'Specific information and updates for affected communities regarding a particular event or incident.'} }
];

// rule inputs: feedType > category1 > category2 > status
// mapping to: 'category','event','eventCode','responseType','severity'
exports.propertiesRules = [
    // DO NOT MODIFY THIS BLOCK - Generated from cut/paste out of CAP_Mappings.xlsx
    {rules:[['warning','Evacuate Immediately','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuate Immediately','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuate Immediately','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuate Immediately','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuate Immediately','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuate Immediately','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Evacuation Update','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Evacuate',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Env']],cap:{category:'Env',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Geo']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Health']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Infra']],cap:{category:'Infra',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Met']],cap:{category:'Met',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Other']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Rescue']],cap:{category:'Rescue',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Safety']],cap:{category:'Safety',tier1:'Product Safety',tier2:'',event:'Product Safety',eventCode:'product',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Security']],cap:{category:'Security',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Recommendation to Evacuate','Transport']],cap:{category:'Transport',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Evacuate',urgency:'Immediate',severity:'Extreme',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Prepare to Evacuate','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Env']],cap:{category:'Env',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Geo']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Health']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Infra']],cap:{category:'Infra',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Met']],cap:{category:'Met',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Other']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Rescue']],cap:{category:'Rescue',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Safety']],cap:{category:'Safety',tier1:'Product Safety',tier2:'',event:'Product Safety',eventCode:'product',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Security']],cap:{category:'Security',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Emergency Warning','Transport']],cap:{category:'Transport',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Watch','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Env']],cap:{category:'Env',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Geo']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Health']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Infra']],cap:{category:'Infra',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Met']],cap:{category:'Met',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Other']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Rescue']],cap:{category:'Rescue',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Safety']],cap:{category:'Safety',tier1:'Product Safety',tier2:'',event:'Product Safety',eventCode:'product',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Security']],cap:{category:'Security',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Watch and Act','Transport']],cap:{category:'Transport',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Advice','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice - All clear','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Env']],cap:{category:'Env',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Geo']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Health']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Infra']],cap:{category:'Infra',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Met']],cap:{category:'Met',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Other']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Rescue']],cap:{category:'Rescue',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Safety']],cap:{category:'Safety',tier1:'Product Safety',tier2:'',event:'Product Safety',eventCode:'product',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Security']],cap:{category:'Security',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Advice','Transport']],cap:{category:'Transport',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'Monitor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Community Update','CBRNE']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Community Update','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Execute',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['warning','Community Update','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Env']],cap:{category:'Env',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Geo']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Health']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Infra']],cap:{category:'Infra',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Met']],cap:{category:'Met',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Other']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Rescue']],cap:{category:'Rescue',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Safety']],cap:{category:'Safety',tier1:'Product Safety',tier2:'',event:'Product Safety',eventCode:'product',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Security']],cap:{category:'Security',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Community Update','Transport']],cap:{category:'Transport',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Final Minor','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Major','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Major (Downgrade from peak)','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Minor','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Minor (Downgrade from moderate)','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Minor to Moderate','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Moderate','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Moderate (Downgrade from major)','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Safe To Return','Flood']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Safe To Return','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Safe To Return','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Safe To Return','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'Minor',urgency:'Future',severity:'Minor',certainty:'Observed'}},
    {rules:[['earthquake','Earthquake','Severe']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['earthquake','Earthquake','Moderate']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['earthquake','Earthquake','Minor']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['earthquake','Earthquake','Extreme']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['earthquake','Earthquake','Unknown']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Fire ban']],cap:{category:'Fire',tier1:'Fire',tier2:'Fire Ban',event:'Fire Ban',eventCode:'fireBan',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Building']],cap:{category:'Fire',tier1:'Fire',tier2:'Structure Fire',event:'Structure Fire',eventCode:'structurFire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Building Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'Structure Fire',event:'Structure Fire',eventCode:'structurFire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Bushfire']],cap:{category:'Fire',tier1:'Fire',tier2:'Bushfire',event:'Bushfire',eventCode:'bushFire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','False Alarm']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Non Building Fire']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Fire','Other']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Planned Burn','Planned Burn']],cap:{category:'Fire',tier1:'Fire',tier2:'',event:'Fire',eventCode:'fire',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Flooding','Flooding']],cap:{category:'Met',tier1:'Flood',tier2:'',event:'Flood',eventCode:'flood',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Other','Dam Failure']],cap:{category:'Infra',tier1:'Flood',tier2:'Dam Failure',event:'Dam Failure',eventCode:'damFailure',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Weather','Cyclone']],cap:{category:'Met',tier1:'Storm',tier2:'Tropical Cyclone',event:'Tropical Cyclone',eventCode:'tropCyclone',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Weather','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Weather','Damaging Winds']],cap:{category:'Met',tier1:'Wind',tier2:'',event:'Wind',eventCode:'wind',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Weather','Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Building Damage','Building Damage']],cap:{category:'Security',tier1:'Civil',tier2:'',event:'Civil',eventCode:'civil',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Power Line','Fallen Power Lines']],cap:{category:'Infra',tier1:'Utility',tier2:'Electricity Supply',event:'Electricity Supply',eventCode:'electric',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Tree Down Traffic Hazard','Tree Down Traffic Hazard']],cap:{category:'Transport',tier1:'Roadway',tier2:'',event:'Roadway',eventCode:'road',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Tree Down','Tree Down']],cap:{category:'Env',tier1:'Plant Health',tier2:'',event:'Plant Health',eventCode:'plant',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Medical','Medical Emergency']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Medical','Medical']],cap:{category:'Health',tier1:'Health',tier2:'',event:'Health',eventCode:'health',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Other','Assist - Ambulance Vic']],cap:{category:'Health',tier1:'Health',tier2:'Ambulance',event:'Ambulance',eventCode:'ambulance',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Heat']],cap:{category:'Met',tier1:'Temperature',tier2:'Extreme Heat',event:'Extreme Heat',eventCode:'extremeHeat',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Agricultural','Animal Health']],cap:{category:'Env',tier1:'Animal Health',tier2:'',event:'Animal Health',eventCode:'animalHealth',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Environment','Invertebrate Animal Plague']],cap:{category:'Env',tier1:'Animal Health',tier2:'Plague',event:'Plague',eventCode:'plague',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Environment','Vertebrate Animal Plague']],cap:{category:'Env',tier1:'Animal Health',tier2:'Plague',event:'Plague',eventCode:'plague',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Agricultural','Plant']],cap:{category:'Env',tier1:'Plant Health',tier2:'',event:'Plant Health',eventCode:'plant',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Hazardous Material','Hazardous Material']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Hazardous Material','Gas Leaks']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Hazardous Material','Liquid Spills']],cap:{category:'CBRNE',tier1:'Hazardous Materials',tier2:'',event:'Hazardous Materials',eventCode:'hazmat',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Road Accident']],cap:{category:'Transport',tier1:'Roadway',tier2:'Motor Vehicle Accident',event:'Motor Vehicle Accident',eventCode:'roadCrash',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Aircraft']],cap:{category:'Transport',tier1:'Aviation',tier2:'Aircraft Incident',event:'Aircraft Incident',eventCode:'aircraft',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Rail']],cap:{category:'Transport',tier1:'Railway',tier2:'Railway Incident',event:'Railway Incident',eventCode:'railIncident',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Ship']],cap:{category:'Transport',tier1:'Marine',tier2:'Nautical Incident',event:'Nautical Incident',eventCode:'nautical',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Earthquake','Earthquake']],cap:{category:'Geo',tier1:'Geological',tier2:'Earthquake',event:'Earthquake',eventCode:'earthquake',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Tsunami','Tsunami']],cap:{category:'Geo',tier1:'Geological',tier2:'Tsunami',event:'Tsunami',eventCode:'tsunami',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Landslide','Landslide']],cap:{category:'Geo',tier1:'Geological',tier2:'Landslide',event:'Landslide',eventCode:'landslide',responseType:'None',urgency:'Past',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Rescue']],cap:{category:'Rescue',tier1:'Rescue',tier2:'',event:'Rescue',eventCode:'rescue',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Washaway']],cap:{category:'Geo',tier1:'Geological',tier2:'',event:'Geological',eventCode:'geologicalHaz',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Usar']],cap:{category:'Rescue',tier1:'Rescue',tier2:'',event:'Rescue',eventCode:'rescue',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Other','Other']],cap:{category:'Other',tier1:'Other Non-Urgent Alerts',tier2:'',event:'Other Non-Urgent Alerts',eventCode:'other',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Incident']],cap:{category:'Other',tier1:'Other Urgent Alerts',tier2:'',event:'Other Urgent Alerts',eventCode:'otherUrgent',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['incident','Accident / Rescue','Trench Rescue']],cap:{category:'Rescue',tier1:'Rescue',tier2:'',event:'Rescue',eventCode:'rescue',responseType:'None',urgency:'Unknown',severity:'Unknown',certainty:'Unknown'}},
    {rules:[['warning','Moderate','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Moderate','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'Execute',urgency:'Expected',severity:'Moderate',certainty:'Observed'}},
    {rules:[['warning','Minor','Severe Weather']],cap:{category:'Met',tier1:'Storm',tier2:'Weather',event:'Weather',eventCode:'weather',responseType:'None',urgency:'Past',severity:'Minor',certainty:'Observed'}},
    {rules:[['warning','Minor','Severe Thunderstorm']],cap:{category:'Met',tier1:'Storm',tier2:'Thunderstorm',event:'Thunderstorm',eventCode:'thunderstorm',responseType:'None',urgency:'Past',severity:'Minor',certainty:'Observed'}},
    {rules:[['incident','Environment','Shark Sighting']],cap:{category:'Env',tier1:'Animals',tier2:'Animal Attack',event:'Animal Attack',eventCode:'animalAttack',responseType:'None',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    {rules:[['incident','Other','Beach Closure']],cap:{category:'Infra',tier1:'Public Services',tier2:'',event:'Public Services',eventCode:'publicServic',responseType:'None',urgency:'Immediate',severity:'Severe',certainty:'Observed'}},
    //END DO NOT MODIFY BLOCK

    // specific rules for event types
    {
        cap: {
            category: 'Other',
            event: 'Other Non-Urgent Alerts',
            eventCode: 'other',
            responseType: 'None',
            severity: 'Minor'
        },
        rules: [
            ['*']
        ]
    }
];
