'use strict';

/* globals Handlebars: false */
/* globals moment: false */
/* globals L: false */
/* globals util: false */

(function () {
    Handlebars._understandAustralianDate = function(stringDate) {
        var givenDate = moment(stringDate, ['DD/MM/YYYY HH:mm:ss','DD/MM/YY hh:mm:ss', moment.defaultFormat]);
        return givenDate;
    };

    Handlebars.registerHelper('list', function(items, options) {
        if( items && items.length ) {
            var out = '';
            for(var i=0, l=items.length; i<l; i++) {
                out += options.fn(items[i]);
            }
            return new Handlebars.SafeString(out);
        } else {
            return new Handlebars.SafeString('');
        }
    });

    Handlebars.registerHelper('map', function (context, options) {
        var ret = '';
        for (var key in context) {
            if (context[key] && context[key] !== 'Null') {
                ret += options.fn({'key': key, value: context[key], object: context});
            }
        }
        return new Handlebars.SafeString(ret);
    });

    Handlebars.registerHelper('timeAgo', function (stringDate) {
        var date = Handlebars._understandAustralianDate(stringDate);
        if( date.isValid() ) {
            return date.fromNow();
        }
        return stringDate;
    });

    Handlebars.registerHelper('timeEpoch', function (stringDate) {
        var date = Handlebars._understandAustralianDate(stringDate);
        if( date.isValid() ) {
            return date.unix()*1000;
        }
        return moment().unix()*1000;
    });

    Handlebars.registerHelper('timeLocal', function (stringDate) {
        var date = Handlebars._understandAustralianDate(stringDate);
        if( date.isValid() ) {
            date.locale('en-AU');
            return date.calendar();
        }
        return stringDate;
    });

    Handlebars.registerHelper('stamp', function (layer) {
        return L.stamp(layer);
    });

    Handlebars.registerHelper('icon', function (iconClass) {
        return new Handlebars.SafeString(util.symbology.getIcon(iconClass));
    });

    Handlebars.registerHelper('roundFloat', function (value) {
        var display = parseFloat(value);
        if( display ) {
            return Math.round(display*10)/10.0;
        }
        return value;
    });

    Handlebars.registerHelper('sizeColumn', function (size, vehicle) {
        if (vehicle !== 0) {
            return (size==='' || size==='N/A'? '':size + ' - ') + vehicle + ' vehicle'+(vehicle===1?'':'s')+' responding';
        } else {
            return (size==='' || size==='N/A'? '':size);
        }
    });

    Handlebars.registerHelper('is', function(a, b, options) {
        if (a === b) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('dateDescriptionPart', function (declaration, selector) {
        var re = new RegExp('(^.*?[0-9]{4})( *)([^ ].*$)');
        var result = re.exec(declaration);
        var ret = '';
        switch (selector) {
            case 'date':
                ret = (result===null) ? '' : result[1];
                break;
            case 'status':
                ret = (result===null) ? '' : result[3] || '';
                break;
            case 'full':
                ret = declaration;
                break;
        }
        return ret;
    });

    Handlebars.registerHelper('subCat', function (arrays, nameType, parentName) {
        var a = '';
        //select names from rules/osom.js
        if (arrays.length === 1) {
            a = arrays[0];
        }
        //clean names to be returned to handlebar template based on type
        if (nameType === 'id') {
            var c = parentName+'-'+a;
            var cleaned = c.toLowerCase().replace( /\//g, '' ).replace(/\s/g, '').replace(/\-/g, '');
            return cleaned;
        } else if (nameType === 'clean') {
            return a;
        } else if (nameType === 'cat') {
            var cleaned = a.toLowerCase().replace( /\//g, '' ).replace(/\s/g, '').replace(/\-/g, '');
            return cleaned;
        }
    });

    Handlebars.registerHelper('nameClean', function (name) {
        var cleaned = name.toLowerCase().replace( /\//g, '' );
        return cleaned;
    });

    Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    });

    Handlebars.registerHelper('if_eq', function (a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    });

    Handlebars.registerHelper('ifActive', function (name) {
        var a = 'active';
        var b = name.split(' ');
        for (var i = 0; i < b.length; i++) {
            if (window.location.href.indexOf(b[i]) <= -1) {
                a = '';
            }
        }
        return a;
    });

    Handlebars.registerHelper('urlEncode', function (url) {
        var encodedUrl = encodeURIComponent(url);
        return encodedUrl;
    });

    Handlebars.registerHelper('toSafeName', function (name) {
        if (name == 'undefined' || name == null) return '';

        var cleaned = name.replace(/[^a-zA-Z0-9]/g, '-')
        return cleaned;
    });
    Handlebars.registerHelper('ifHeatHealth', function (loc, cat) {
        if (cat == 'Heat Health' || cat == 'Heat Health Alert') {
            return;
        } else {
            return loc;
        }
    });

})();
