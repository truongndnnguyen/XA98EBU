'use strict';

var app = app || {};
app.rules = app.rules || {};
app.rules.prepareGR = app.rules.prepareGR || {};

(function () {

    this.filters = [
        {
            name: 'Being Prepared',
            hasChild: true,
            checkedable: false,
            //contentUrl: 'being-prepared',
            iconClass: 'icon-controls-thumbup_24x24',
            expandIconClass: 'icon-controls-thumbup_white_24x24',
            childrens: [
            {
                name: 'Understanding Warnings',
                contentUrl: 'being-prepared/understanding-warnings',
                description: '',
                checkedable: true
            },
            {
                name: 'Where do I get information?',
                checkedable: true,
                contentUrl: 'being-prepared/who-can-help-me'
            },
            {
                name: 'Emergency Radio & TV stations',
                checkedable: false,
                childrens: [
                    {
                        name: 'ABC Coverage',
                        checkedable: true,
                        description: 'During emergencies, Victoria\'s emergency broadcasters will broadcast information, including updates and community alerts, to help you to make decisions based on the advice of the emergency services. If necessary, emergency warnings will interrupt normal programming on the radio and TV.',
                        contentUrl: "being-prepared/emergency-radio-tv-stations/abc-coverage"
                    },
                    //{
                    //    name: 'Commercial Broadcasters',
                    //    checkedable: true,
                    //    filterName: 'ignore'
                    //},
                    //{
                    //    name: 'Community Broadcasters',
                    //    checkedable: true,
                    //    filterName: 'ignore'
                    //},
                    {
                        name: 'Sky News',
                        checkedable: true,
                        contentUrl: "being-prepared/emergency-radio-tv-stations/sky-news"
                    },
                    //{
                    //    name: 'Relief centres',
                    //    checkedable: true,
                    //    description:'When an emergency has the potential to displace residents and visitors, local Councils will open an Emergency Relief Centre. These are community buildings that will provide support and essential needs to people who have been affected.',
                    //    filterName: 'ignore'
                    //},
                ]
            },
            {
                name: 'FireReady App',
                checkedable: true,
                contentUrl: "being-prepared/emergency-radio-tv-stations/fireready-app"
            },
            {
                name: 'Who\'s who in Victorian Emergencies',
                checkedable: false,
                childrens: [
                    {
                        name: 'Who\'s who in Victorian Emergencies',
                        checkedable: false,
                        contentUrl: 'being-prepared/whos-who-in-victorian-emergencies',
                    },
                    {
                        name: 'CFA map boundaries',
                        checkedable: true,
                        description: 'Shows the area covered by the CFA outlined by its numbered districts',
                        filterName: 'CFA map boundaries'
                    },
                    {
                        name: 'MFB map boundaries',
                        checkedable: true,
                        description: 'Shows the area covered by the MFB ',
                        filterName: 'MFB map boundaries'
                    }
                ]
            }]
        },
{
    name: 'Fire',
    //contentUrl: 'fire',
    hasChild: true,
    checkedable: false,
    iconClass: 'icon-controls-fire_24x24',
    expandIconClass: 'icon-controls-fire_white_24x24',
    childrens: [
    {
        name: 'Understanding fire',
        checkedable: true,
        contentUrl: 'fire/understanding-fire/understanding-fire'
    },
    {
        name: 'Am I at risk of fire?',
        checkedable: true,
        contentUrl: 'fire/am-i-at-risk-of-fire/am-i-at-risk-of-fire'
    },
    {
        name: 'Fire Danger Ratings',
        checkedable: true,
        description: 'The Fire Danger Ratings are a scale that forecasts how dangerous a fire would be if one started. They are forecast for three days in advance, using Bureau of Meteorology weather data and other environmental conditions such as fuel loads.',
        filterName: 'Fire Danger Rating Today'
    },
    //{
    //    name: 'Fire Danger Periods',
    //    checkedable: true,
    //    description: 'The CFA calls the Fire Danger Period to restrict the use of fire in the community over summer. The Fire Danger Period is called for each shire or council individually depending on the local conditions and can start as early as October.',
    //    filterName: 'ignore'
    //},
    {
        name: 'Total Fire Bans',
        checkedable: true,
        contentUrl: 'fire/am-i-at-risk-of-fire/total-fire-bans'
    },
    {
        name: 'Risk by township',
        checkedable: true,
        description:'The Victorian Fire Risk Register maps the areas considered of risk of bushfire. ',
        filterName: 'Risk by township'
    },
    {
        name: 'Bushfire history',
        checkedable: true,
        description: 'This shows the areas burnt by bushfires over the last 50 years.',
        filterName: 'Bushfire history'
    },
    {
        name: 'Preparing for fires',
        checkedable: true,
        contentUrl: 'fire/preparing-for-fires/preparing-for-fires'
    },
    {
        name: 'Community Information Guides',
        checkedable: true,
        description: 'Community Informaiton Guides provide relevant information on bushfire planning in your local area.',
        contentUrl: 'fire/community-information-guides'
    },

    //{
    //    name: 'Community fire refuges',
    //    checkedable: true,
    //    description: 'Community Fire Refuges (CFRs) are only activated and opened once there is significant fire in the area. They are a last resort option if you cannot leave during a fire. ',
    //    filterName: 'ignore'
    //},
    {
        name: 'Neighbourhood safer places',
        checkedable: true,
        filterName: 'Safer Places'
    },
    {
        name: 'Planned burns & works',
        checkedable: true,
        contentUrl: 'fire/planned-burns-works/planned-burns-works'
    },

    //{
    //    name: 'Burns in next 10 days',
    //    checkedable: 'true',
    //    description: 'Shows all planned burns on public land scheduled for the next 10 days',
    //    filterName:'ignore'
    //},
    {
        name: 'Last 10 years - treated area',
        checkedable: true,
        description: 'Shows all planned burns completed on public land over the past 5 years',
        filterName: 'Last 10 years - treated area'
    },
    //{
    //    name: 'Fuel breaks',
    //    checkedable: true,
    //    description: 'Shows all permanent fuel breaks on in parks and forests. A fuel break is a cleared area of ground vegetation that acts as a barrier to slow the progress of a bushfire',
    //    filterName: 'ignore'
    //}

    ]
},
{
    name: 'Flood',
    //contentUrl: 'flood',
    iconClass: 'icon-controls-flood_24x24',
    expandIconClass: 'icon-controls-flood_white_24x24',
    childrens: [
    {

        name: 'Understanding flood',
        checkedable: true,
        contentUrl: 'flood/understanding-flood/understanding-flood'
    },
    {
        name: 'Am I at risk of flood?',
        checkedable: true,
        contentUrl: 'flood/am-i-at-risk-of-flood'
    },
    {
        name: 'Flood history',
        checkedable: false,
        childrens: [
            {
                name: 'Flood history - 100 years',
                checkedable: true,
                description: 'This shows the areas impacted by flooding over the last 100 years',
                filterName: 'Flood history - 100 years'
            },
            {
                name: 'Flood history - 50 years',
                checkedable: true,
                description: 'This shows the areas impacted by flooding over the last 50 years',
                filterName: 'Flood history - 50 years'
            },
            {
                name: 'Flood history - 20 years',
                description: 'This shows the areas impacted by flooding over the last 20 years',
                checkedable: true,
                filterName: 'Flood history - 20 years'
            },
            {
                name: 'Flood history - 10 years',
                description: 'This shows the areas impacted by flooding over the last 10 years',
                checkedable: true,
                filterName: 'Flood history - 10 years'
            }
        ]
    },
    {
        name: 'Preparing for floods',
        checkedable: true,
        contentUrl: 'flood/preparing-for-floods/preparing-for-floods'
    },
    {
        name: 'Local Flood Guides',
        checkedable: true,
        contentUrl: 'flood/local-flood-guides'
    },
    ]
},
{
    name: 'Storm',
    //contentUrl: 'storm',
    iconClass: 'icon-controls-storm_24x24',
    expandIconClass: 'icon-controls-storm_white_24x24',
    childrens: [
        {
            name: 'Understanding storms',
            checkedable: true,
            contentUrl: 'storm/understanding-storms'
        },
        {
            name: 'Am I at risk of storms?',
            checkedable: true,
            contentUrl: 'storm/am-i-at-risk-of-storms'
        },
        {
            name: 'Preparing for storms',
            checkedable: true,
            contentUrl: 'storm/preparing-for-storms'
        }
    ]
},
{
    name: 'Earthquake',
    //contentUrl: 'earthquake',
    iconClass: 'icon-controls-Earthquake_24x24',
    expandIconClass: 'icon-controls-Earthquake_white_24x24',
    childrens: [
        {
            name: 'Understanding earthquake',
            checkedable: true,
            contentUrl: 'earthquake/understanding-earthquake'
        },
        {
            name: 'Am I at risk of earthquake?',
            checkedable: true,
            contentUrl: 'earthquake/am-i-at-risk-of-earthquakes'
        },
        {
            name: 'Preparing for an earthquake',
            checkedable: true,
            contentUrl: 'earthquake/preparing-for-an-earthquake'
        }
    ]
},
{
    name: 'Tsunami',
    //contentUrl: 'tsunami',
    iconClass: 'icon-controls-Tsunami_24x24',
    expandIconClass: 'icon-controls-Tsunami_white_24x24',
    childrens: [
        {
            name: 'Understanding tsunami',
            checkedable: true,
            contentUrl: 'tsunami/understanding-tsunami'
        },
        {
            name: 'Am I at risk of tsunami?',
            checkedable: true,
            contentUrl: 'tsunami/am-i-at-risk-of-tsunami'
        },
        {
            name: 'Preparing for a tsunami',
            checkedable: true,
            contentUrl: 'tsunami/preparing-for-a-tsunami'
        }
    ]
},
{
    name: 'Extreme Heat',
    //contentUrl: 'extreme-heat',
    iconClass: 'icon-controls-ExtremeHeat_24x24',
    expandIconClass: 'icon-controls-ExtremeHeat_white_24x24',
    childrens: [
        {
            name: 'Understanding extreme heat',
            checkedable: true,
            contentUrl: 'extreme-heat/understanding-extreme-heat'
        },
        {
            name: 'Am I at risk of extreme heat?',
            checkedable: true,
            contentUrl: 'extreme-heat/am-i-at-risk-of-exteme-heat'
        },
        {
            name: 'Preparing for extreme heat',
            checkedable: true,
            contentUrl: 'extreme-heat/preparing-for-extreme-heat'
        }
    ]
}
    ]

}).apply(app.rules.prepareGR);
