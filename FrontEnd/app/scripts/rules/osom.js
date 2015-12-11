'use strict';

var app = app||{};
app.rules = app.rules || {};
app.rules.osom = app.rules.osom || {};

(function() {

    /*
    ## Mapping for item (incident/warning) catg[, subcatg][, status].
    ## The format of the keys are: Category;Sub-category;Status
    ## * indicates a wildcard
    ## Matching categories are separated by ","'s
    ##
    ## Default mappings depend on catg and subcatg.
    ## - Fire mappings depend on catg and status.
    ## - Warning mappings depend only on subcatg.
    ## - Other mappings mostly depend only on catg.
    */
    this.filters = [
        {
            fixed: true,
            name: 'Warnings',
            priority: 1000,
            rules: [
                ['warning'],
                ['public-info']
            ]
        }, {
            name: 'Fire',
            priority: 900,
            rules: [
                ['incident','Fire'],
                ['incident','Planned Burn'],
                ['burn-area']
            ],
            watchFilter: [
                ['Fire'],
                ['Total Fire Bans'],
                ['Planned Burn']
            ]
        }, {
            name: 'Flood',
            priority: 800,
            rules: [
                ['incident','Flooding'],
                ['incident','Met', 'Flood'],
                ['incident','Other','Dam Failure']
            ],
            watchFilter: [
                ['Flood'],
                ['Dam Failure']
            ]
        }, {
            name: 'Weather',
            priority: 700,
            iconClass: 'weather-severe',
            rules: [
                ['incident','Weather'],
                ['incident','Tree Down Traffic Hazard'],
                ['incident','Tree Down'],
                ['incident','Power Line'],
                ['incident','Building Damage'],
                ['incident','Met'] // CAP-AU
            ],
            watchFilter: [
                ['Cyclone'],
                ['Weather'],
                ['Damaging Wind'],
                ['Building Damage'],
                ['Fallen Power Lines'],
                ['Tree Down']
            ]
        }, {
            name: 'Health',
            priority: 600,
            iconClass: 'medical',
            rules: [
                ['incident','Medical'],
                ['incident','Other','Assist - Ambulance Vic'],
                ['incident','Accident / Rescue','Heat'],
                ['incident','Health'] // CAP-AU
            ],
            watchFilter: [
                ['Health'],
                ['Heat']
            ]
        }, {
            name: 'Animal/Plant',
            priority: 500,
            iconClass: 'locust-plague',
            rules: [
                ['incident','Environment'],
                ['incident','Agricultural'],
                ['incident','Env'] // CAP-AU
            ],
            watchFilter: [
                ['Animal Health'],
                ['Insect Plague'],
                ['Animal Plague'],
                ['Oil Wildlife'],
                ['Shark Sighting'],
                ['Plant Disease']
            ]
        }, {
            name: 'Spill/Leak',
            priority: 400,
            iconClass: 'hazardous-material',
            rules: [
                ['incident','Hazardous Material'],
                ['incident','CBRNE'] // CAP-AU
            ],
            watchFilter: [
                ['Hazmat'],
                ['Gas Leaks'],
                ['Liquid'],
                ['Water Pollution']
            ]
        }, {
            name: 'Transport',
            priority: 300,
            iconClass: 'ar-road',
            rules: [
                ['incident', 'Accident / Rescue', 'Aircraft'],
                ['incident', 'Accident / Rescue', 'Rail'],
                ['incident', 'Accident / Rescue', 'Road Accident'],
                ['incident', 'Accident / Rescue', 'Ship'],
                ['incident','Tree Down Traffic Hazard'],
                ['incident','Power Line'],
                ['incident','Rescue'], // CAP-AU
                ['incident','Safety'], // CAP-AU
                ['incident','Transport'] // CAP-AU
            ],
            watchFilter: [
                ['Road Accident'],
                ['Fallen Powerlines'],
                ['Aircraft'],
                ['Rail'],
                ['Ship']
            ]
        }, {
            name: 'Earthquake/Tsunami',
            priority: 200,
            iconClass: 'earthquake',
            rules: [
                ['incident','Tsunami'],
                ['incident','Landslide'],
                ['incident','Earthquake'],
                ['earthquake'],
                ['incident','Geo'] // CAP-AU
            ],
            watchFilter: [
                ['Earthquake'],
                ['Tsunami'],
                ['Landslide']
            ]
        }, {
            name: 'Other',
            priority: 100,
            rules: [
                ['incident','Building Damage'],
                ['incident','Landslide'],
                ['incident','Tree Down Traffic Hazard'],
                ['incident','Tree Down'],
                ['incident','Power Line'],
                ['incident','Accident / Rescue','Incident'],
                ['incident','Accident / Rescue','Rescue'],
                ['incident','Accident / Rescue','Trench Rescue'],
                ['incident','Rescue'], // CAP-AU
                ['incident','Safety'], // CAP-AU
                ['incident','Infra'], // CAP-AU
                ['incident','Security'] // CAP-AU
            ],
            watchFilter: [
                ['Rescue'],
                ['Building Damage'],
                ['Power Line'],
                ['Tree Down'],
                ['Landslide'],
                ['Beach Closure'],
                ['Other']
            ]
        }
    ];

    this.styles = [
        // burn area
        {
            iconClass: 'burn-area',
            unlisted: true,
            style: {
                color: '#000',
                opacity: 0.6,
                fillColor: '#000',
                fillOpacity: 0.2,
                stroke: true,
                weight: 4,
                important: true
            },
            rules: [['*','Burn Area']]
        },

        // public info (COP)
        {
            iconClass: 'public-info',
            style: {
                color: '#0000FF',
                opacity: 1.0,
                fillColor: '#0000ff',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [['public-info']]
        },

        // warnings
        {
            iconClass: 'evacuate',
            alertClass: 'evacuate',
            headline: 'Evacuate',
            style: {
                color: '#000',
                opacity: 1.0,
                fillColor: '#000',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Recommendation to Evacuate']
            ]
        },
        {
            iconClass: 'evacuate',
            alertClass: 'evacuate',
            headline: 'Evacuate Immediately',
            style: {
                color: '#000',
                opacity: 1.0,
                fillColor: '#000',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Evacuate Immediately']
            ]
        },
        {
            iconClass: 'evacuate',
            alertClass: 'evacuate',
            headline: 'Evacuation Update',
            style: {
                color: '#000',
                opacity: 1.0,
                fillColor: '#000',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Evacuation Update']
            ]
        },
        {
            iconClass: 'evacuate',
            alertClass: 'evacuate',
            headline: 'Prepare to Evacuate',
            style: {
                color: '#000',
                opacity: 1.0,
                fillColor: '#000',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Prepare to Evacuate']
            ]
        },
        {
            iconClass: 'emergency',
            alertClass: 'emergency',
            headline: 'Emergency Warning',
            style: {
                color: '#E52E25',
                opacity: 1.0,
                fillColor: '#E52E25',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Emergency Warning','Earthquake'],
                ['warning','Marine','Tsunami'],
                ['warning','Land','Tsunami'],
                ['warning','Emergency Warning']
            ]
        },
        {
            iconClass: 'watchact',
            alertClass: 'watchact',
            headline: 'Watch and Act',
            style: {
                color: '#E96825',
                opacity: 1.0,
                fillColor: '#E96825',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Watch and Act']
            ]
        },
        {
            iconClass: 'watchact',
            alertClass: 'watchact',
            headline: 'Warning',
            style: {
                color: '#E96825',
                opacity: 1.0,
                fillColor: '#E96825',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Major'],
                ['warning','Major (Downgrade from peak)'],
                ['warning','Moderate'],
                ['warning','Moderate (Downgrade from major)'],
                ['warning','Moderate to Major'],
                ['warning','Minor to Moderate']
            ]
        },
        {
            iconClass: 'community_update',
            headline: 'Community Update',
            style: {
                color: '#254896',
                opacity: 1.0,
                fillColor: '#254896',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [['warning','Community Update']]
        },
        {
            iconClass: 'advice',
            alertClass: 'advice',
            headline: 'Advice',
            style: {
                color: '#F4DA28',
                opacity: 1.0,
                fillColor: '#F4DA28',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [['warning','Advice']]
        },
        {
            iconClass: 'advice',
            alertClass: 'advice',
            headline: 'Advice',
            style: {
                color: '#FBDC28',
                opacity: 1.0,
                fillColor: '#FBDC28',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [
                ['warning','Watch'],
                ['warning','Minor'],
                ['warning','Final Minor'],
                ['warning','Safe To Return'],
                ['warning','Minor (Downgrade from moderate)']
            ]
        },
        {
            iconClass: 'advice',
            alertClass: 'advice',
            headline: 'Advice',
            style: {
                color: '#FBDC28',
                opacity: 1.0,
                fillColor: '#FBDC28',
                fillOpacity: 0.3,
                stroke: true,
                weight: 3
            },
            rules: [['warning']]
        },

        // fire
        {
            iconClass: 'total_fire_ban',
            rules: [['incident','Fire','Total Fire Ban']]
        },
        {
            iconClass: 'planned_burn',
            rules: [['incident','Fire','Planned Burn']]
        },
        {
            iconClass: 'fire-inactive',
            rules: [
                ['incident','Fire','*','Responding'],
                ['incident','Fire','*','Not Yet Under Control'],
                ['incident','Fire','*','GOING']
            ]
        },
        {
            iconClass: 'fire-inactive',
            rules: [['incident','Fire','*','Under Control'],['incident','Fire','*','Safe'],['incident','Fire']]
        },
        {
            iconClass: 'planned_burn',
            rules: [['incident','Planned Burn','*','In Progress']]
        },
        {
            iconClass: 'planned_burn',
            rules: [['incident','Planned Burn','*','Patrolled'],['incident','Planned Burn','*','Safe'],['incident','Planned Burn']]
        },

        // medical
        { iconClass: 'medical', rules: [
            ['incident','Accident / Rescue','Heat'],
            ['incident','Medical'],
            ['incident','Other','Assist - Ambulance Vic']
        ] },

        // animal/plant
        { iconClass: 'plant-pest-disease', rules: [
            ['incident','Met', 'Plant Disease'],
            ['incident','Agricultural','Plant']
        ] },
        { iconClass: 'animal-health', rules: [['incident','Agricultural','Animal Health']] },
        { iconClass: 'locust-plague', rules: [['incident','Environment','Invertebrate Animal Plague']] },
        { iconClass: 'vertebrate-animal-plague', rules: [['incident','Environment','Vertebrate Animal Plague']] },

        // spill/leak
        { iconClass: 'hazardous-material-gas-leak', rules: [['incident','Hazardous Material','Gas Leaks']] },
        { iconClass: 'hazardous-material-liquids', rules: [['incident','Hazardous Material','Liquid Spills']] },
        { iconClass: 'hazardous-material', rules: [['incident','Hazardous Material']] },

        // transport
        { iconClass: 'ar-road', rules: [['incident','Accident / Rescue','Road Accident']] },
        { iconClass: 'ar-aircraft', rules: [['incident','Accident / Rescue','Aircraft']] },
        { iconClass: 'ar-rail', rules: [['incident','Accident / Rescue','Rail']] },
        { iconClass: 'ar-ship', rules: [['incident','Accident / Rescue','Ship']] },

        // earthquake/tsunami
        { iconClass: 'earthquake', rules: [
            ['incident','Earthquake', 'Earthquake'], //VicSES synthetic incident
            ['incident','Earthquake'],
            ['earthquake','Earthquake']
        ] },
        { iconClass: 'tsunami', rules: [
            ['incident','Tsunami', 'Tsunami'], //VicSES synthetic incident
            ['incident','Tsunami']
        ] },
        { iconClass: 'landslide', rules: [['incident','Landslide']] },

        { iconClass: 'tree-down', rules: [['incident','Tree Down']] },
        { iconClass: 'tree-down-traffic-hazard', rules: [['incident','Tree Down Traffic Hazard']] },
        { iconClass: 'building-damage', rules: [['incident','Building Damage']] },
        { iconClass: 'flooding', rules: [
            ['incident','Flood', 'Flood'], //VicSES synthetic incident
            ['incident','Met', 'Flood'], //VicSES synthetic incident
            ['incident','Flooding']
        ] },
        { iconClass: 'weather-severe', rules: [
            ['incident','Met', 'Weather'],
            ['incident','Met', 'Severe Weather'],
            ['incident','Severe Weather', 'Severe Weather'], //VicSES synthetic incident
            ['incident','Met', 'Fire Weather'],
            ['incident','Met', 'Road Weather'],
            ['incident','Weather', 'Severe Weather']
        ] },
        { iconClass: 'weather-thunderstorm', rules: [
            ['incident','Severe Thunderstorm', 'Severe Thunderstorm'], //VicSES synthetic incident
            ['incident','Weather', 'Thunderstorm']
        ] },
        { iconClass: 'weather-damaging', rules: [
            ['incident','Met', 'Wind'],
            ['incident','Weather', 'Damaging Winds']
        ] },
        { iconClass: 'weather-cyclone', rules: [['incident','Weather', 'Cyclone']] },
        { iconClass: 'power-line', rules: [['incident','Power Line']] },
        { iconClass: 'dam-failure', rules: [
            ['incident','Dam Failure', 'Dam Failure'], //VicSES synthetic incident
            ['incident','Other', 'Dam Failure']
        ] },

        // other
        { iconClass: 'ar-rescue', rules: [['incident','Accident / Rescue']] }
    ];

    this.priorities = [
        { priority: 10, rules: [['earthquake','Earthquake','Unknown']]},
        { priority: 60, rules: [['earthquake','Earthquake','Minor']]},
        { priority: 70, rules: [['earthquake','Earthquake','Moderate']]},
        { priority: 80, rules: [['earthquake','Earthquake','Severe']]},
        { priority: 90, rules: [['earthquake','Earthquake','Extreme']]},
        { priority: 40, rules: [['incident','Fire','Total Fire Ban']]},
        { priority: 5,  rules: [['incident','Planned Burn','*','In Progress']]},
        { priority: 5,  rules: [['incident','Planned Burn','*','Patrolled']]},
        { priority: 5,  rules: [['incident','Planned Burn','*','Safe']]},
        { priority: 5,  rules: [['incident','Fire','Planned Burn']]},
        { priority: 4,  rules: [['incident','Planned Burn']]},
        { priority: 20, rules: [['incident','Accident / Rescue','Aircraft']]},
        { priority: 10, rules: [['incident','Accident / Rescue','Heat']]},
        { priority: 10, rules: [['incident','Accident / Rescue','Incident']]},
        { priority: 15, rules: [['incident','Accident / Rescue','Rail']]},
        { priority: 90, rules: [['incident','Accident / Rescue','Rescue']]},
        { priority: 90, rules: [['incident','Accident / Rescue','Road Accident']]},
        { priority: 10, rules: [['incident','Accident / Rescue','Ship']]},
        { priority: 0,  rules: [['incident','Accident / Rescue','Trench Rescue']]},
        { priority: 50, rules: [['incident','Accident / Rescue','Usar']]},
        { priority: 60, rules: [['incident','Accident / Rescue','Washaway']]},
        { priority: 80, rules: [['incident','Agricultural','Animal Health']]},
        { priority: 40, rules: [['incident','Agricultural','Plant']]},
        { priority: 50, rules: [['incident','Building Damage','Building Damage']]},
        { priority: 90, rules: [['incident','Earthquake','Earthquake']]},
        { priority: 70, rules: [['incident','Environment','Invertebrate Animal Plague']]},
        { priority: 60, rules: [['incident','Environment','Vertebrate Animal Plague']]},
        { priority: 70, rules: [['incident','Hazardous Material','Gas Leaks']]},
        { priority: 80, rules: [['incident','Hazardous Material','Hazardous Material']]},
        { priority: 60, rules: [['incident','Hazardous Material','Liquid Spills']]},
        { priority: 53, rules: [['incident','Landslide','Landslide']]},
        { priority: 80, rules: [['incident','Medical','Medical Emergency']]},
        { priority: 70, rules: [['incident','Medical','Medical']]},
        { priority: 20, rules: [['incident','Other','Assist - Ambulance Vic']]},
        { priority: 30, rules: [['incident','Other','Dam Failure']]},
        { priority: 20, rules: [['incident','Other','Other']]},
        { priority: 40, rules: [['incident','Power Line','Fallen Power Lines']]},
        { priority: 35, rules: [['incident','Tree Down Traffic Hazard','Tree Down Traffic Hazard']]},
        { priority: 30, rules: [['incident','Tree Down','Tree Down']]},
        { priority: 55, rules: [['incident','Tsunami','Tsunami']]},
        { priority: 90, rules: [['incident','Weather','Cyclone']]},
        { priority: 70, rules: [['incident','Weather','Damaging Winds']]},
        { priority: 80, rules: [['incident','Weather','Severe Weather']]},
        { priority: 60, rules: [['incident','Weather','Thunderstorm']]},

        { priority: 90, rules: [
            ['warning','Recommendation to Evacuate'],
            ['warning','Evacuate Immediately'],
            ['warning','Evacuation Update'],
            ['warning','Prepare to Evacuate']
        ]},
        { priority: 70, rules: [
            ['warning','Marine','Tsunami'],
            ['warning','Land','Tsunami'],
            ['warning','Emergency Warning']
        ]},
        { priority: 60, rules: [
            ['warning','Watch and Act'],
            ['warning','Major'],
            ['warning','Major (Downgrade from peak)'],
            ['warning','Moderate'],
            ['warning','Moderate (Downgrade from major)'],
            ['warning','Moderate to Major'],
            ['warning','Minor to Moderate']
        ]},
        { priority: 50, rules: [
            ['warning','Advice'],
            ['warning','Watch'],
            ['warning','Minor'],
            ['warning','Final Minor'],
            ['warning','Safe To Return'],
            ['warning','Minor (Downgrade from moderate)']
        ]},
        { priority: 10, rules: [['warning','Community Update']]},
        { priority: 0,  rules: [['warning']]},

        { priority: 0,  rules: [['incident','Other','Battery Fault']]},
        { priority: 0,  rules: [['incident','Other','Equipment Fault']]},
        { priority: 0,  rules: [['incident','Other','Full Call']]},
        { priority: 0,  rules: [['incident','Other','Late Notification']]},
        { priority: 0,  rules: [['incident','Other','Line Fault']]},
        { priority: 0,  rules: [['incident','Other','Move Up']]},
        { priority: 0,  rules: [['incident','Other','Part Call']]},
        { priority: 0,  rules: [['incident','Other','Test Timeout']]},
        { priority: 0,  rules: [['incident','Other','Trivial Calls']]},
        { priority: 0,  rules: [['incident','Other']]},
        { priority: 0,  rules: [['public-info']]},
        { priority: 90, rules: [['incident','*','*','Extreme']]},
        { priority: 50, rules: [['incident','*','*','Not Yet Under Control']]},
        { priority: 50, rules: [['incident','*','*','GOING']]},
        { priority: 50, rules: [['incident','*','*','Severe']]},
        { priority: 50, rules: [['incident','*','*','Responding']]},
        { priority: 50, rules: [['incident','*','*','Moderate']]},
        { priority: 50, rules: [['incident','*','*','Unknown']]},
        { priority: 10, rules: [['incident','*','*','Minor']]},
        { priority: 10, rules: [['incident','*','*','Under Control']]},
        { priority: 10, rules: [['incident','*','*','Safe']]},
        { priority: 6,  rules: [['incident','Fire']]}
    ];

}).apply(app.rules.osom);
