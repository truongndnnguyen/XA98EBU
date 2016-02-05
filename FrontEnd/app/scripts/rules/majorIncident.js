'use strict';

var app = app||{};
app.rules = app.rules || {};
app.rules.majorIncident = app.rules.majorIncident || {};

(function() {
    //extend osom rules, this file has to be included after osom.js
    this.additionFilters = [
        {
            name: 'Closure',
            priority: 80,
            rules: [
                ['major-incident', 'Airport Closure'],
                ['major-incident', 'Port Closure'],
                ['major-incident', 'Park Closed'],
                ['major-incident', 'Road Closed'],
                ['major-incident', 'Rail Disruptions'],
                ['major-incident', 'School Closure'],
                ['major-incident', 'Track Closed'],
                ['major-incident', 'Other Closed'],
                ['major-incident', 'Beach Closure'],
                ['incident','Other','Beach Closure'],
            ]
        },
        {
            name: 'Outage',
            priority: 70,
            rules: [
                    ['major-incident', 'Gas Outage'],
                    ['major-incident', 'Water Outage']
            ]
        },
        {
            name: 'Media',
            priority: 70,
            rules: [
                ['major-incident', 'Media Assembly Point']
            ]
        },
        {
            name: 'Quarantine',
            priority: 900,
            rules: [
                ['major-incident', 'Special Restricted area - Animal Health'],
                ['major-incident', 'Special Restricted area - Quarantine'],
                ['major-incident', 'Special Restricted area - Plant Health']
            ]
        },
        {
            name: 'Social Media',
            priority: 60,
            rules: [
                ['major-incident','Youtube'],
                ['major-incident','Facebook'],
                ['major-incident','Twitter'],
                ['major-incident','Instagram']
            ]
        },
        {
            name: 'Community',
            priority: 90,
            rules: [
                ['major-incident', 'Community Document'],
                ['major-incident', 'Community Information Point'],
                ['major-incident', 'Neighbourhood Safer Place'],
                ['major-incident', 'Community Relief Centre']
            ]
        },
    ];
    this.filters = this.additionFilters;

    if (app && app.rules && app.rules.osom) {
        this.filters = app.rules.osom.filters.concat(this.additionFilters);
    }
    //???
    this.matchRules = function (ruleName, feedType) {
        var result = [];
        this.filters.map(function (f) {

            if (feedType === 'warning' && f.name === 'Warnings') {
                result.push(f);
            }
            else {
                var matches = f.rules.filter(function (item) {
                    return $.inArray(ruleName, item) > -1 || (feedType === 'warning' && item.name === 'Warnings');
                    //return item.toLowerCase() == category.toLowerCase();
                });
                if (matches.length > 0) {
                    result.push(f);
                }
            }

        });
        if (result.length == 0) {
            result.push({ name: 'Other',
            priority:100 })
        }
        var matches = app.rules.osom.priorities.filter(function(rule) {
            return $.inArray(ruleName, rule.rules) > -1;
        });
        if(feedType !== 'warning'){
            result.push({ name: ruleName ,
                priority: (matches && matches.length>0) ? matches[0].priority : 0});
        }
        return result;
    }

}).apply(app.rules.majorIncident);
