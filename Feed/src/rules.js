/**
    Evaluates rulesets against object values.  Used to classify data into groups for datasets.

    this.filters = [{
        name: 'Warnings',
        rules: [['warning']]
    }, {
        name: 'Major Incidents',
        rules: [['public-info']]
    }, {
        name: 'Accident',
        rules: [['incident','Accident / Rescue'],
            ['incident','Hazardous Material']]
    }, {
        name: 'Environmental',
        rules: [['incident','Environment'],
            ['incident','Agricultural']]
    }, {
        name: 'Essential Services',
        rules: [['incident','Power Line'],
            ['incident','Tree Down Traffic Hazard']]
    }, {
        name: 'Fire / Explosion',
        rules: [['incident','Fire'],['incident','Planned Burn'],['burn-area']]
    }, {
        name: 'Human Disease / Illness',
        rules: [['incident','Medical']]
    }, {
        name: 'Natural Event',
        rules: [['incident','Building Damage'],
            ['incident','Flooding'],
            ['incident','Weather'],
            ['incident','Tsunami'],
            ['incident','Landslide'],
            ['incident','Tree Down']]
    }, {
        name: 'Search / Rescue',
        rules: [['incident','Accident / Rescue','Rescue']]
    }, {
        name: 'Other',
        rules: [['incident','Other'],['*']]
    }];

*/

'use strict';

exports.name = 'rules';

exports.test = function(rule,vals) {
    for(var i=0; i<rule.length; i++) {
        if( rule[i] === '*' ) {
            continue;
        }
        if( vals.length<=i ) {
            return false;
        }
        if( vals[i] !== rule[i] ) {
            return false;
        }
    }
    return true;
};

exports.execute = function(ruleSets, values) {
    for(var i=0; i<ruleSets.length; i++) {
        var f = ruleSets[i];
        for(var fc=0; fc<f.rules.length; fc++) {
            var rule = f.rules[fc];
            if( this.test(rule,values) ) {
                return f;
            }
        }
    }
    return null;
};

exports.executeMultiMatch = function(ruleSets, values) {
    var results = [];
    for(var i=0; i<ruleSets.length; i++) {
        var f = ruleSets[i];
        for(var fc=0; fc<f.rules.length; fc++) {
            var rule = f.rules[fc];
            if( this.test(rule,values) ) {
                results.push(f);
            }
        }
    }
    return results;
};
