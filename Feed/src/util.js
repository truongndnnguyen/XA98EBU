var moment = require('moment-timezone');

exports.parseDate = function(str, formats) {
    formats = formats || ['DD/MM/YYYY h:mm:ss A','DD/MM/YY h:mm:ss A', 'DD/MM/YYYY HH:mm:ss','DD/MM/YY hh:mm:ss'];
    if( str ) {
        var date = moment.tz(str, formats, 'Australia/Melbourne');
        if( date.isValid() ) {
            return date.toISOString();
        }
        return null;
    }
    return null;
};

exports.withinDateRange = function(begins, ends) {
    if( begins ) {
        var beginstz = moment.parseZone(begins);
        if( ! moment().isAfter(beginstz) ) {
            return false;
        }
    }
    if( ends ) {
        var endstz = moment.parseZone(ends);
        if( ! moment().isBefore(endstz) ) {
            return false;
        }
    }
    return true;
};

exports.parseISODate = function(str) {
    var date = moment.parseZone(str);
    if( date.isValid() ) {
        return date;
    }
    return null;
};

exports.addToDate = function(begins, buffer, units) {
    if( begins ) {
        var beginstz = moment.parseZone(begins);
        beginstz.add(buffer, units);
        return beginstz.toISOString();
    }
    return begins;
};

exports.currentDate = function(format) {
    return moment().tz('Australia/Melbourne').format(format || 'DD/MM/YYYY');
};
exports.dateDiff = function (date1, date2) {

    var now = moment(date1,'DD/MM/YYYY');
    var end = moment(date2,'DD/MM/YYYY');
    var duration = moment.duration(now.diff(end));

    return duration.asDays();
}
