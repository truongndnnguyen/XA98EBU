'use strict';

/* globals app: false */

var util = util||{};
util.staticPageHandler = util.staticPageHandler || {};

(function() {
    this.showJumper = function() {
        $('.jump-to-top').show();
    };

    this.hideJumper = function() {
        $('.jump-to-top').hide();
    };

    this.getPageParams = function() {
        // returns {mainPage:null, subPage:null}, {...:'about', ...:null} or {...:'about', ...:'acknowledgements'}-like object
        var re = new RegExp('#!/([^/]*)(/([^/]*))?$');
        var res = window.location.hash.match(re);
        var ret = { mainPage: null, subPage: null };
        if ((res!==null) && (res.length>=4)) {
            if (res[3]===undefined) {
                ret = { mainPage: res[1], subPage: null };
            } else {
                ret = { mainPage: res[1], subPage: res[3] };
            }
        }
        return ret;
    };

    this.getPageHtmlFromPageParams = function(staticPageGroup, recognisedPages, pageParams) {
        var html = '';
        var mainPage = pageParams.mainPage;
        var isEmptyPageOnMobile = (mainPage === null) && util.mediaQuerier.isMobileView();
        if (isEmptyPageOnMobile) {
            html = '';
        } else {
            if (mainPage === null) {
                mainPage = recognisedPages[0];
            }
            switch (staticPageGroup) {
                case 'prepare':
                    html = app.templates.static.prepare[mainPage]();
                    break;
                case 'relief':
                    html = app.templates.static.relief[mainPage]();
                    break;
                case 'about-this-site':
                    html = app.templates.static.standard[mainPage]();
                    break;
                default:
                    html = 'This page doesn\'t exist.';
                    break;
            }
        }
        return html;
    };

    this.createMediaQuerier = function() {
        $('.accordion-menu').after(util.mediaQuerier.getHtml());
    };

    this.makeItemContainersClickable = function() {
        $('.accordion-menu .panel-body .item').on('click', function(ev) {
            var aTag = ev.target;
            if (ev.target.tagName !== 'A') { // if the <a href...> tag itself is clicked then no simluation is needed
                aTag = $(ev.target).find('a').filter(':visible')[0];
            }
            window.location = aTag.href;
            ev.stopPropagation();
            return false;
        });
    };

    this.makePanelHeadingsClickable = function() {
        $('.accordion-menu .panel-heading').on('click', function(ev) {
            if ($(ev.target)[0].tagName !== 'A') {  // prevent infinite recursion
                var heading = $(ev.target).closest('.panel-heading');
                var aTag = heading.find('a').filter(':visible');
                aTag.click();
            }
        });
    };

    this.indicateExternalLinks = function() {
        $('a.external').each(function(index, el) {
            var html = '&nbsp;<span class="fa fa-external-link" aria-hidden="true"></span>';
            $(el).attr('target', '_blank');
            $(el).after(html);
        });
    };

    this.selectAccordionSubItem = function(pageParams) {
        var selector = '.panel-title a.static-menu-' + pageParams.mainPage;
        var aTags = $(selector).parents('.panel').find('.panel-body .item a');
        var re = new RegExp('/#!/([^/]+)/([^/]*)$');
        aTags.each(function(index, element) {
            var href = $(element).attr('href');
            var found = href.match(re);
            if ((found.length >= 3) && (found[2]===pageParams.subPage)) {
                $(element).click();
            }
        });
    };

    this.selectAccordionMainItem = function(pageParams) {
        var selector = '.accordion-menu .static-menu-' + pageParams.mainPage;
        var panelCollapse = $(selector).parents('.panel').find('.panel-collapse');
        panelCollapse.collapse({parent: '#accordion'});
        panelCollapse.collapse('show');
    };

    this.openAccordionItemOfPage = function(pageParams) {
        /*
        /relief/#!/fire/who-can-help
            mobile: open relevant main menu, select the relevant sub-item and display/jump to it
            desktop: open relevant main menu, select the relevant sub-item and display/jump to it

        /relief/#!/fire
            mobile: don't open the accordion but display the top of the page
            desktop: open the accordion and display the top of the page

        /relief/#!
            mobile: nothing to open, display only the menu
            desktop: nothing to open, display top of the first main menu
        */

        if (pageParams.mainPage===null) {   //  /relief/#!
            return;
        }

        if (pageParams.subPage===null) {   //  /relief/#!/fire
            if (!util.mediaQuerier.isMobileView()) {
                this.selectAccordionMainItem(pageParams);
            }
            return;
        }

        // /relief/#!/fire/who-can-help
        this.showJumper();
        this.selectAccordionMainItem(pageParams);
        this.selectAccordionSubItem(pageParams);
    };

    this.focusSubItem = function(pageParams) {
        $('.main-text .item a').each(function(index, el) {
            if (el.name===pageParams.subPage) {
                var nextElement = $(el).next();
                var whatToFocus = (nextElement.length===0 ? $(el) : nextElement);
                whatToFocus.attr('tabindex', '-1');   // make it focusable
                $('a[name=bottom]').focus();  // without this the heading may be scrolled just to the _bottom_ of the screen
                whatToFocus.focus();
            }
        });
    };

    this.jumpToTop = function() {
        $('#static-content').scrollTop(0);
        util.staticPageHandler.hideJumper();
    };

    this.initJumpToTop = function() {
        $('.jump-to-top a').on('click', function(ev) {
            util.staticPageHandler.jumpToTop();
            ev.stopPropagation();
            return false;
        });
        this.hideJumper();
    };

    this.init2 = function(recognisedPages, staticPageGroup, callback) {
        this.oldPageParams = null;
        this.recognisedPages = recognisedPages;
        this.staticPageGroup = staticPageGroup;

        var isMapExisting = false;
        app.ui.init(isMapExisting);
        $('.panel-heading a').on('click', function(ev) {
            var panelCollapse = $(ev.target).parents('.panel').find('.panel-collapse');
            panelCollapse.collapse({parent: '#accordion'});
            panelCollapse.collapse('toggle');
            ev.stopPropagation();
            var isJumping = !util.mediaQuerier.isMobileView();  // mobile=>toggles accordion, tablet/desktop=>jump
            if (isJumping) {
                window.location = ev.target.href;
            } else {
                return false;
            }
        });
        $('.panel-collapse a').on('click', function(ev) {
            window.location = ev.target.href;
        });
        this.makeItemContainersClickable();
        this.makePanelHeadingsClickable();
        this.createMediaQuerier();
        this.handleUrlChange(callback);
        $(window).on('hashchange', function() {
            util.staticPageHandler.handleUrlChange(callback);
        });
    };

    this.getIsPageChanged = function(pageParams) { //,recognisedPages
        var ret = { mainPage: false, subPage: false };
        //var isFirstMainPageSelected = (pageParams.mainPage === recognisedPages[0]);
        if ((this.oldPageParams === null) || (pageParams.mainPage!==this.oldPageParams.mainPage)) {
            ret.mainPage = true;
        }
        if ((this.oldPageParams === null) || (this.oldPageParams.subPage!==null && pageParams.subPage!==this.oldPageParams.subPage )) {
            ret.subPage = true;
        }
        this.oldPageParams = pageParams;
        return ret;
    };

    this.handleUrlChange = function(callback) {
        var pageParams = util.staticPageHandler.getPageParams();
        var html = util.staticPageHandler.getPageHtmlFromPageParams(this.staticPageGroup, this.recognisedPages, pageParams);
        var isPageChanged = this.getIsPageChanged(pageParams, this.recognisedPages);
        if (callback!==undefined) {
            callback(html, pageParams, isPageChanged);
        }
        this.initJumpToTop();
        this.openAccordionItemOfPage(pageParams);
        this.focusSubItem(pageParams);
    };
}).apply(util.staticPageHandler);
