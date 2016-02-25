var victoria = require('../config/reference/victoria-buffer-50km.json'),
    log = require('./log'),
    turf = require('turf');

function intersectBounds(feature, polygon) {
    try {
        var bounds = turf.bboxPolygon(turf.extent(feature));
        return turf.intersect(bounds, polygon);
    } catch(ex) {
        log.error('Exception caught during filtering '+feature.geometry.type+' by bounds: ',ex);
        return true;
    }
}

function isIntersecting(feature, polygon) {
    try {
        return turf.intersect(feature, polygon);
    } catch(ex) {
        log.info('Exception caught during filtering '+feature.geometry.type+': ',ex);
        return intersectBounds(feature, polygon);
    }
}

function isInside(feature, polygon) {
    try {
        return turf.inside(feature, polygon);
    } catch(ex) {
        log.info('Exception caught during filtering '+feature.geometry.type+': ',ex);
        return intersectBounds(feature, polygon);
    }
}

exports.isBoundingBox = function(feature, polygon) {   
    if( !feature.geometry ) {
        // console.log('DEBUG: rejecting feature with no geometry', JSON.stringify(feature.properties,null,2));
        return false;
    }
    if( feature.geometry.type === 'GeometryCollection' ) {
        var inside = false;
        feature.geometry.geometries.forEach(function(geom) {
            inside = inside || exports.isBoundingBox({'type':'Feature','geometry':geom}, polygon);
        });
        // if(!inside) {
        //     console.log('DEBUG: rejecting feature with geometry collection', JSON.stringify(feature,null,2));
        // }
        return inside;
    } else if( (feature.geometry.type === 'Polygon') || (feature.geometry.type === 'MultiPolygon') ) {
        return isIntersecting(feature, polygon);
    } else {
        return isInside(feature, polygon);
    }
}

exports.inVictoria = function(feature) {
    if( !feature.geometry ) {
        // console.log('DEBUG: rejecting feature with no geometry', JSON.stringify(feature.properties,null,2));
        return false;
    }
    if( feature.geometry.type === 'GeometryCollection' ) {
        var inside = false;
        feature.geometry.geometries.forEach(function(geom) {
            inside = inside || exports.inVictoria({'type':'Feature','geometry':geom});
        });
        // if(!inside) {
        //     console.log('DEBUG: rejecting feature with geometry collection', JSON.stringify(feature,null,2));
        // }
        return inside;
    } else if( (feature.geometry.type === 'Polygon') || (feature.geometry.type === 'MultiPolygon') ) {
        return isIntersecting(feature, victoria);
    } else {
        return isInside(feature, victoria);
    }
};
