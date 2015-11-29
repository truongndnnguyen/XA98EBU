'use strict';

var app = app||{};
app.rules = app.rules || {};
app.rules.bom = app.rules.bom || {};

(function() {

    this.filters = [
    // {
    //     thematicLayer: true,
    //     defaultHidden: true,
    //     name: 'Weather Warnings',
    //     rules: 'bom:weather-warnings',
    //     wmsLayerURL: 'http://wvs2.bom.gov.au/mapcache/meteye',
    //     wmsLayerConf: [
    //         {layers:'ADFDWEATHER', opacity: 0.4} // major weather events heatmap
    //     ]
    // },
    {
        thematicLayer: true,
        defaultHidden: true,
        name: 'Rain Radar',
        rules: 'bom:rain-radar',
        wmsLayerURL: 'http://wvs2.bom.gov.au/mapcache/meteye',
        wmsLayerConf: [
            {layers:'IDR00010'} // IDE10012,cloud cover + rain radar
        ]
    }, {
        thematicLayer: true,
        defaultHidden: true,
        name: 'Wind Direction',
        rules: 'bom:wind-direction',
        wmsLayerURL: 'http://wvs2.bom.gov.au/mapcache/meteye',
        wmsLayerConf: [
            {layers:'IDZ73071,IDZ73089', opacity: 0.6} // ,IDY03110_windkmh, gridded wind direction + wind speed (kph) (IDZ73006,IDZ73089)
        ]
    }, {
        thematicLayer: true,
        defaultHidden: true,
        name: 'Thunderstorm Tracker',
        rules: 'bom:thunderstorm-tracker',
        wmsLayerURL: 'http://wvs2.bom.gov.au/mapcache/meteye',
        wmsLayerConf: [
            {layers:'IDZ73094'} // Thunderstorms
        ]
    }];

}).apply(app.rules.bom);
