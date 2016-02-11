'use strict';

/* globals app: false */

var util = util||{};
util.symbology = util.symbology || {};

(function() {

    this.init = function() {
    };

    this.conversionTable = {
        'safer-place':                 { 'className' : 'icon-Neighbourhood_Safer_Place'   , 'svgId' : 'markers--community--Neighbourhood_Safer_Place'  },
        'public-info':                 { 'className' : 'icon-Community_Document'          , 'svgId' : 'markers--community--Community_Document'         },
        'evacuate':                    { 'className' : 'icon-Evacuate'                    , 'svgId' : 'markers--warning--Evacuate'                     },
        'emergency':                   { 'className' : 'icon-Emergency_Warning'           , 'svgId' : 'markers--warning--Emergency_Warning'            },
        'watchact':                    { 'className' : 'icon-Warning-Watch_and_Act'       , 'svgId' : 'markers--warning--Warning-Watch_and_Act'        },
        'advice':                      { 'className' : 'icon-Advice'                      , 'svgId' : 'markers--warning--Advice'                       },
        'community_update':            { 'className' : 'icon-Community_Update'            , 'svgId' : 'markers--warning--Community_Update'             },
        'fire-danger-rating':          { 'className' : 'icon-Fire_Danger_Ratings'         , 'svgId' : 'markers--weather--Fire_Danger_Ratings'         },
        'fire-active':                 { 'className' : 'icon-Fire_Active'                 , 'svgId' : 'markers--incident--Fire_Active'                 },
        'fire-inactive':               { 'className' : 'icon-Fire'                        , 'svgId' : 'markers--incident--Fire'                        },
        'total-fire-ban':              { 'className' : 'icon-Total_Fire_Ban'              , 'svgId' : 'markers--closure--Total_Fire_Ban'                },
        'planned_burn':                { 'className' : 'icon-Planned_Burn'                , 'svgId' : 'markers--incident--Planned_Burn'                },
        'hazmat':                      { 'className' : 'icon-Hazardous_Material'          , 'svgId' : 'markers--incident--Hazardous_Material'          },
        'ar-aircraft':                 { 'className' : 'icon-Aircraft_Incident'           , 'svgId' : 'markers--incident--Aircraft_Incident'           },
        'ar-rail':                     { 'className' : 'icon-Rail_Incident'               , 'svgId' : 'markers--incident--Rail_Incident'               },
        'ar-rescue':                   { 'className' : 'icon-Rescue'                      , 'svgId' : 'markers--incident--Rescue'                      },
        'ar-road':                     { 'className' : 'icon-Accident_Collision'          , 'svgId' : 'markers--incident--Accident_Collision'          },
        'ar-ship':                     { 'className' : 'icon-Ship_Incident'               , 'svgId' : 'markers--incident--Ship_Incident'               },
        'medical':                     { 'className' : 'icon-Health'                      , 'svgId' : 'markers--incident--Health'                      },
        'tree-down':                   { 'className' : 'icon-Tree_Hazard'                 , 'svgId' : 'markers--incident--Tree_Hazard'                 },
        'building-damage':             { 'className' : 'icon-Building_damage'             , 'svgId' : 'markers--incident--Building_damage'             },
        'earthquake':                  { 'className' : 'icon-Earthquake'                  , 'svgId' : 'markers--incident--Earthquake'                  },
        'weather-severe':              { 'className' : 'icon-Severe_Weather'              , 'svgId' : 'markers--incident--Severe_Weather'              },
        'landslide':                   { 'className' : 'icon-Landslide'                   , 'svgId' : 'markers--incident--Landslide'                   },
        'power-line':                  { 'className' : 'icon-Fallen_Power_Lines'          , 'svgId' : 'markers--incident--Fallen_Power_Lines'          },
        'tree-down-traffic-hazard':    { 'className' : 'icon-Tree_Hazard'                 , 'svgId' : 'markers--incident--Tree_Hazard'                 },
        'plant-pest-disease':          { 'className' : 'icon-Plant_Pest_Disease'          , 'svgId' : 'markers--incident--Plant_Pest_Disease'          },
        'vertebrate-animal-plague':    { 'className' : 'icon-Vertebrate_Animal_Plague'    , 'svgId' : 'markers--incident--Vertebrate_Animal_Plague'    },
        'animal-health':               { 'className' : 'icon-Animal_Health'               , 'svgId' : 'markers--incident--Animal_Health'               },
        'locust-plague':               { 'className' : 'icon-Locust_Plague'               , 'svgId' : 'markers--incident--Locust_Plague'               },
        'other':                       { 'className' : 'icon-Other_Incident'              , 'svgId' : 'markers--incident--Other_Incident'              },
        'dam-failure':                 { 'className' : 'icon-Dam_Failure'                 , 'svgId' : 'markers--incident--Dam_Failure'                 },
        'hazardous-material':          { 'className' : 'icon-Hazardous_Material'          , 'svgId' : 'markers--incident--Hazardous_Material'          },
        'hazardous-material-gas-leak': { 'className' : 'icon-Hazardous_Material_Gas_Leak' , 'svgId' : 'markers--incident--Hazardous_Material_Gas_Leak' },
        'hazardous-material-liquids':  { 'className' : 'icon-Hazardous_Material_Liquids'  , 'svgId' : 'markers--incident--Hazardous_Material_Liquids'  },
        'shark-sighting':              { 'className' : 'icon-Shark_Sighting'              , 'svgId' : 'markers--incident--Shark_Sighting'              },
        'beach-closures':              { 'className' : 'icon-Beach_Closures'              , 'svgId' : 'markers--incident--Beach_Closures'              },
        'flooding':                    { 'className' : 'icon-Flood'                       , 'svgId' : 'markers--weather--Flood'                        },
        'weather-thunderstorm':        { 'className' : 'icon-Storm'                       , 'svgId' : 'markers--weather--Storm'                        },
        'weather-damaging':            { 'className' : 'icon-Damaging_Winds'              , 'svgId' : 'markers--weather--Damaging_Winds'               },
        'weather-cyclone':             { 'className' : 'icon-Cyclone'                     , 'svgId' : 'markers--weather--Cyclone'                      },
        'tsunami':                     { 'className' : 'icon-Tsunami'                     , 'svgId' : 'markers--weather--Tsunami'                      },
        'burn-area':                   { 'className' : 'icon-Burn-Area'                   , 'svgId' : 'markers--Burn-Area'                             },
        //major only
        'airport-closure':             { 'className' : 'icon-Airport_Closure'             , 'svgId' : 'markers--closure--Airport_Closure'              },
        'other-closed':                { 'className' : 'icon-Other_Closed'                , 'svgId' : 'markers--closure--Other_Closed'                },
        'park-closed':                 { 'className' : 'icon-Park_Closed'                 , 'svgId' : 'markers--closure--Park_Closed'                  },
        'port-closure':                { 'className' : 'icon-Port_Closure'                , 'svgId' : 'markers--closure--Port_Closure'                 },
        'rail-disruptions':            { 'className' : 'icon-Rail_Disruptions'            , 'svgId' : 'markers--closure--Rail_Disruptions'             },
        'road-closed': { 'className': 'icon-Road_Closed', 'svgId': 'markers--closure--Road_Closed' },
        'road-works': { 'className': 'icon-Road_Works', 'svgId': 'markers--closure--Road_Works' },
        'school-closure':              { 'className' : 'icon-School_Closure'              , 'svgId' : 'markers--closure--School_Closure'               },
        'track-closed':                { 'className' : 'icon-Track_Closed'                , 'svgId' : 'markers--closure--Track_Closed'                 },
        'community-info':              { 'className' : 'icon-Community_Information_Point' , 'svgId' : 'markers--community--Community_Information_Point'},
        'community-refuge':            { 'className' : 'icon-Community_Refuge'            , 'svgId' : 'markers--community--Community_Refuge'           },
        'community-relief':            { 'className' : 'icon-Community_Relief_Centre'     , 'svgId' : 'markers--community--Community_Relief_Centre'    },
        'community-siren':             { 'className' : 'icon-Community_Siren'             , 'svgId' : 'markers--community--Community_Siren'            },
        'social-facebook':             { 'className' : 'icon-Facebook'                    , 'svgId' : 'markers--social--Facebook'                      },
        'social-instagram':            { 'className' : 'icon-Instagram'                   , 'svgId' : 'markers--social--Instagram'                     },
        'social-twitter':              { 'className' : 'icon-Twitter'                     , 'svgId' : 'markers--social--Twitter'                       },
        'social-youtube':              { 'className' : 'icon-Youtube'                     , 'svgId' : 'markers--social--Youtube'                       },
        'weather-gauge':               { 'className' : 'icon-Gauge'                       , 'svgId' : 'markers--weather--Gauge'                        },
        'weather-temperature':         { 'className' : 'icon-Temperature'                 , 'svgId' : 'markers--weather--Temperature'                  },
        'weather-wind-direction':      { 'className' : 'icon-Wind_Direction'              , 'svgId' : 'markers--weather--Wind_Direction'               },
        'electricity-outage':          { 'className' : 'icon-Electricity_Outage'          , 'svgId' : 'markers--outage--Electricity_Outage'            },
        'gas-outage':                  { 'className' : 'icon-Gas_Outage'                  , 'svgId' : 'markers--outage--Gas_Outage'                    },
        'water-outage':                { 'className' : 'icon-Water_Outage'                , 'svgId' : 'markers--outage--Water_Outage'                  },
        'media-assembly-point':        { 'className' : 'icon-Media_Assembly_Point'        , 'svgId' : 'markers--media--Media_Assembly_Point'           },
        'water-pollution':             { 'className' : 'icon-Water_pollution'             , 'svgId' : 'markers--incident--Water_pollution'             },
        'oiled-wildlife':              { 'className' : 'icon-Oiled_Wildlife'              , 'svgId' : 'markers--incident--Oiled_Wildlife'              },
        'petroleum-oil-spill':         { 'className' : 'icon-Petroleum_Oil_Spill'         , 'svgId' : 'markers--incident--Petroleum_Oil_Spill'         },
        'quarantine-animal':           { 'className' : 'icon-Special_Restricted_area_Animal-Health' , 'svgId' : 'markers--quarantine--Special_Restricted_area_Animal_Health'  },
        'quarantine-plant':            { 'className' : 'icon-Special_Restricted_area_Plant-Health'  , 'svgId' : 'markers--quarantine--Special_Restricted_area_Plant_Health'   },
        'quarantine-quarantine':       { 'className' : 'icon-Special_Restricted_area_Quarantine'    , 'svgId' : 'markers--quarantine--Special_Restricted_area_Quarantine'     }
    };

    this.getImageIdentifier = function(iconClass, format) {
        var field = ( format === 'svg' ? 'svgId' : 'className' );
        var ret = this.conversionTable[iconClass];
        if (!ret || !ret[field]) {
            return this.conversionTable.other[field];
        }
        return ret[field];
    };

    this.getSvgIcon = function(iconClass, isCluster, assistiveText) {
        var svgSymbolId = this.getImageIdentifier(iconClass, 'svg');
        var imageData = {
            'svgSymbolId': svgSymbolId,
            'isCluster': isCluster === true,
            'assistiveText': assistiveText
        };
        var html = app.templates.icon.svg(imageData);
        return html;
    };

    this.getPngIcon = function(iconClass, isCluster, assistiveText) {
        var className = this.getImageIdentifier(iconClass, 'png');
        var imageData = {
            'className': className,
            'isCluster': isCluster === true,
            'assistiveText': assistiveText
        };
        var html = app.templates.icon.png(imageData);
        return html;
    };

    this.getIcon = function(iconClass, isCluster, assistiveText) {
        var ret = (util.detect.isIE() ? this.getPngIcon(iconClass, isCluster, assistiveText) : this.getSvgIcon(iconClass, isCluster, assistiveText) );
        return ret;
    };

}).apply(util.symbology);
