var transfer = require('../transfer'),
    log = require('../log'),
    async = require('async');

// create input and output directories to store intermediate files
exports.name = 'cms-feed';
exports.description = 'CMS Feed for published articles';
exports.category = 'cms';
exports.feeds = {
    // s3: {
    //     Key: 'osom-burn-area-geojson.json',
    //     ContentType: 'application/json',
    //     Body: {}
    // },
    statusPage: false,
    firehose: false,
    textonly: false,
    cap: false
};
exports.features = [];
exports.pages = {};

exports.issueRequest = function(config, cb) {    
    /* ?? need to setup a sample file return from cms.
        if(cmsEndpoint.indexOf('file') === 0)
            url = cmsEndpoint;
    */

    var requestors = {};
    config.CMS_ENDPOINTS.forEach(function(endpoint){
        requestors[endpoint.name] = function(cbx) {
            transfer.issueJSONRequest(cbx, endpoint.url, exports.category+'/'+exports.name+'-'+endpoint.name+'.json');
        };
    });
    async.parallel(requestors, function(err, results) {
        if (err) {
            log.error('Caught during CMS endpoint fetch: '+err);
            cb(err, null);
            exports.status = 'ERROR';
            return;
        }
        log.info('Successfully retrieved CMS endpoints');
        cb(null, results);
    });
};

// transform feed to geojson features and set the s3 payload
exports.transform = function(data) {
    var localViewPublishedUrl = "http://em-public.ci.devcop.em.vic.gov.au/local-view/";

    news = [];
    if(data.news) {
        data.news.nodes.forEach(function(node) {
            news.push({
                nodeId: node.nid,
                incidentId: node.incident_id,
                stage: node.incident_stage,
                title: node.article_title,
                postedDate: node.posted_date,
                url: localViewPublishedUrl + "news/" + node.nid
            })
        });
    }

    relief = [];
    if(data.relief) {
        data.relief.nodes.forEach(function(node) {
            relief.push({
                nodeId: node.nid,
                incidentId: node.incident_id,
                stage: node.incident_stage,
                title: node.article_title,
                postedDate: node.posted_date,
                url: localViewPublishedUrl + "relief/" + node.nid
            })
        });
    }

    scheduled = [];
    if(data.scheduled) {
        data.scheduled.nodes.forEach(function(node) {
            scheduled.push({
                nodeId: node.nid,
                incidentId: node.incident_id,
                stage: node.incident_stage,
                title: node.article_title,
                location: node.venue_details,
                postedDate: node.scheduled_date,
                scheduledDate: node.scheduled_time.value_formatted,
                url: localViewPublishedUrl + "scheduled/" + node.nid
            })
        });
    }
    
    exports.pages = {
        news: news,
        relief: relief,
        scheduled: scheduled
    };
};
