var moment = require('moment-timezone');

function _understandAustralianDate(stringDate) {
    return moment.tz(stringDate, ['DD/MM/YYYY HH:mm:ss','DD/MM/YY hh:mm:ss', moment.defaultFormat], 'Australia/Melbourne');
}

exports.register = function(handlebars) {

    handlebars.registerHelper('warningClass', function (feedType) {
        return (feedType === 'warning') ? 'warning' : 'not-warning';
    });

    handlebars.registerHelper('timeEpoch', function (stringDate) {
        var date = _understandAustralianDate(stringDate);
        if( date.isValid() ) {
            return date.unix()*1000;
        }
        return moment().unix()*1000;
    });

    handlebars.registerHelper('url', function (url) {
        return encodeURIComponent(url);
    });

    handlebars.registerHelper('timeLocal', function (stringDate) {
        var date = _understandAustralianDate(stringDate);
        if( date.isValid() ) {
            date.locale('en-AU');
            return date.calendar();
        }
        return stringDate;
    });

    handlebars.registerHelper('dateLocal', function (stringDate) {
        var date = _understandAustralianDate(stringDate);
        if( date.isValid() ) {
            date.locale('en-AU');
            return date.format('dddd, MMMM Do YYYY');
        }
        return stringDate;
    });

    handlebars.registerHelper('timeISO', function (stringDate) {
        var date = _understandAustralianDate(stringDate);
        if( date.isValid() ) {
            date.locale('en-AU');
            return date.format();
        }
        return stringDate;
    });

};
