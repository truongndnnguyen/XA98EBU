'use strict';

var app = app || {};
app.rules = app.rules || {};
app.rules.reliefRecovery = app.rules.reliefRecovery || {};

(function () {

    this.filters = [
        {
            name: 'General Information',
            headingCss: 'general-info',
            containerCss : 'general-info-wrapper',
            collapseCss:'general-info-collapseable-panel',
            childrens: [
                {
                    name: 'General info for local councils',
                    hasChild: true,
                    checkedable: true,
                    contentUrl: 'being-prepared/who-can-help-me'
                },
                {
                    name: 'Finnace and emotional assistance',
                    hasChild: true,
                    checkedable: true,
                    contentUrl: 'being-prepared/who-can-help-me'
                }
            ]
        },
        {
            name: 'After a fire',
            hasChild: true,
            checkedable: true,
            headingCss: 'general-info',
            containerCss: 'general-info-wrapper',
            contentUrl: 'being-prepared/who-can-help-me'
        },
        {
            name: 'After a flood',
            hasChild: true,
            headingCss: 'general-info',
            checkedable: true,
            containerCss: 'general-info-wrapper',
            contentUrl: 'being-prepared/who-can-help-me'
        },
        {
            name: 'After a storm',
            hasChild: true,
            headingCss: 'general-info',
            checkedable: true,
            containerCss: 'general-info-wrapper',
            contentUrl: 'being-prepared/who-can-help-me'
        },
        {
            name: 'After a Earthquake',
            hasChild: true,
            headingCss: 'general-info',
            checkedable: true,
            containerCss: 'general-info-wrapper',
            contentUrl: 'being-prepared/who-can-help-me'
        },
        {
            name: 'After a extreme heat',
            hasChild: true,
            headingCss: 'general-info',
            checkedable: true,
            containerCss: 'general-info-wrapper',
            contentUrl: 'being-prepared/who-can-help-me'
        }
    ]

}).apply(app.rules.reliefRecovery);
