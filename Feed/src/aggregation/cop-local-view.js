var transfer = require('../transfer'),
    filter = require('../filter'),
    turf = require('turf'),
    log = require('../log');

// create input and output directories to store intermediate files
exports.name = 'cop-local-view';
exports.description = 'COP Local View pages for incidents and warnings';
exports.category = 'cop';
exports.feeds = {
    s3collection: []
};

exports.issueRequest = null;
exports.majorIncidents = [];
// integrate feed events with OSOM Incidents and OSOM Warnings
exports.integrate = function(datasetsMap, config) {
    var datafiles = datasetsMap['major-incident'].datafiles;
    var cmsPages = datasetsMap['cms-feed'].pages;
    var copFeed =  datasetsMap['major-incident'].features;

    Object.keys(datafiles).forEach(function(id) {
        var majorIncident = transformIncident(id, datafiles[id], cmsPages, copFeed);
        if(majorIncident)
            exports.majorIncidents.push(majorIncident);
    })

};



// aggregate the firehose datasets into the s3 payload
exports.aggregate = function(datasets) {
console.log("")
    exports.features = [];
    datasets.forEach(function(dataset){
        if( dataset.feeds.localview === true ) {
            exports.features = exports.features.concat(dataset.features);
        }
    });

    exports.majorIncidents.forEach(function(incident) {

        if(!incident.incidentInfo.bbox)  {
            log.warn('No bounding box for :', incident.incidentInfo.publicRoomId);
            return;
        }            

        var bbox = turf.bboxPolygon(incident.incidentInfo.bbox)

        var filteredIncidents = exports.features.filter(function(feature) {
            return filter.isBoundingBox(feature, bbox);
        });

        filteredIncidents.forEach(function(incident){
            incident.properties.style = {
                    color: null,
                    opacity: null,
                    fillcolor: null,
                    fillopacity: null,
                    fieldpattern: null
                }
        })

        incident.geoJson.features = incident.geoJson.features.concat(filteredIncidents);
 
        incident.incidentInfo.bbox = bbox;

        exports.feeds.s3collection.push({
            Key: 'local-view/'+incident.incidentInfo.publicRoomId+'.json',
            ContentType: 'application/json',
            ContentEncoding: 'gzip',
            Body: JSON.stringify(incident)
        });
    })
};



function transformIncident(id, data, allPages, copFeed) {
    if(data === null)
        {return null};

    var liwFeedGeoJSON = data.geoJson;
    var liwFeedMetaData = data.metadata;
    var layers = [];

    //Grab the incident info from the cop feed that matches the room id from the datafile.
    incident = copFeed.filter(function(cop) { 
                    if (cop.properties.id === id) 
                        return cop ;
                });

    //ExternalId will exist if there should be a matching external feed incident. 
    //InternalId is the id for the cop published room. 
    //These Id's are used to match for news articles against the cms.
    var incidentExternalId = (incident[0]) ? incident[0].properties.incidentexternalref : "";
    var incidentInternalId = liwFeedMetaData.incidentId;

    if(liwFeedGeoJSON.features) {
        liwFeedGeoJSON.features.forEach(function(d) {
            delete d.geometry_name;
            delete d.id;
            //console.log("LIW: ", ( d.properties.attributes) ? d.properties.attributes.description : d.properties.labeltext);

            var attributes = JSON.parse(d.properties.attributes);
            var attrDescription = (attributes) ? attributes.description : null;
            var name = (attrDescription) ? attrDescription : d.properties.labeltext;
            var cssClass = (d.properties.labeltext) ?  "label" : (attrDescription) ? attrDescription.toLowerCase().replace(/ /g,"-") : d.geometry.type
            var icon = null;
            var fillcolor = (d.properties.fillcolor.indexOf("url")) ? d.properties.fillcolor : null;
            var fieldpattern = (d.properties.fillcolor.indexOf("url")) ? null : d.properties.fillcolor.substring(5, d.properties.fillcolor.length - 1); //if feed contains a polygon with a fill pattern
            var comment =  (attributes) ? attributes.comments : null;

            if(d.properties.graphicurl) {
                icon = d.properties.graphicurl.substring(d.properties.graphicurl.lastIndexOf("/")+1);
            }


            d.properties = {
                feedType: 'major-incident',
                category1: attrDescription,
                category2: null,
                cssClass: cssClass,
                id: d.properties.featureid,
                icon: icon,
                webbody: comment,
                created: d.properties.time, //iso date time
                updated: d.properties.lastupdate, //iso date time

                name: name,
                style: {
                    color: d.properties.strokecolor,
                    opacity: d.properties.strokeopacity,
                    fillcolor: fillcolor,
                    fillopacity: d.properties.opacity,
                    fieldpattern: fieldpattern,
                    dashstyle: d.properties.dashstyle,
                    weight: d.properties.strokewidth
                }

            };
        });
    }

    //filter the cms-pages news to by the relevant id
    var news = getMatchedPages(allPages.news, incidentExternalId, incidentInternalId, liwFeedMetaData.incidentStage);
    
    news.sort(function(a,b){
        return b.postedDate - a.postedDate
    }); 

    var relief = getMatchedPages(allPages.relief, incidentExternalId, incidentInternalId, liwFeedMetaData.incidentStage);
    
    relief.sort(function(a,b){
        return b.postedDate - a.postedDate
    });

    var scheduled = getMatchedPages(allPages.scheduled, incidentExternalId, incidentInternalId, liwFeedMetaData.incidentStage);
    
    scheduled.sort(function(a,b){
        return b.postedDate - a.postedDate
    });

    var incidentInfo = {
        publicRoomId: id,
        incidentExternalId: incidentExternalId,
        incidentInternalId: incidentInternalId,
        bbox: liwFeedMetaData.bbox,
        incidentStage: liwFeedMetaData.incidentStage,
        centerLng: liwFeedMetaData.centerLon,
        centerLat: liwFeedMetaData.centerLat,
        generalInfo: liwFeedMetaData.generalInfo,
        publicName: liwFeedMetaData.publicName,
        zoomLevel: liwFeedMetaData.zoomLevel,
        publishDate: liwFeedMetaData.publishDate,
    };

    return {
        geoJson: liwFeedGeoJSON,
        layers: liwFeedMetaData.layers,
        pages:  {
            news: news,
            relief: relief,
            scheduled: scheduled
        },
        incidentInfo: incidentInfo
    };
}


function getMatchedPages(pages, incidentExternalId, incidentInternalId, incidentStage)
{
    //filter out based on incident id (external and internal) and stage 
    var matchedPages = pages.filter(function(page) { 
                    if (page.incidentId == incidentExternalId || page.incidentId == incidentInternalId ) {
                        var matchStage = false;
                        page.stage.forEach(function(stage) {
                            //handles name mismatch between CMS and EMCOP
                            if (stage === 'Relief') {
                                stage = 'Recovery'
                            }
                            if(incidentStage === stage) {
                               matchStage = true; }
                        });    
                        return matchStage;
                    }    
                });

    return matchedPages.map(function(page) {
        return {
             nodeId: page.nodeId,
             postedDate: page.postedDate,
             scheduledDate: (page.scheduledDate) ? page.scheduledDate : null,
             url: page.url,
             title: page.title,
             location: (page.location) ? page.location : null
        }
    });
}