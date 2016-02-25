'use strict';
var app = app || {};
app.major = app.major || {};
app.major.major = app.major.major || {};

(function () {
    this.newsArticles = null;
    this.reliefArticles = null;
    this.scheduledArticles = null;
    this.newsUrl = null;
    this.reliefUrl = null;
    this.scheduledUrl = null;
    this.maskExist = false;
    this.bounds = null;
    this.selectedURL = null;
    this.firstTimeLoad = true;

    this.whichPage = function() {
        var url = document.location.pathname;
        var page = '';
        if (url.indexOf('prepare-local') > -1) {
            page = 'Prepare';
        } else if (url.indexOf('respond-local') > -1) {
            page = 'Response';
        } else if (url.indexOf('relief-local') > -1) {
            page = 'Recovery';
        }
        return page;
    }

    this.returnDate = function(date, longDate) {
        if (longDate) {
            return [moment.unix(date).format("DD MMMM YYYY"),''];
        } else {
            return [moment.unix(date).format("MMM"),moment.unix(date).format("DD")];
        }
    };

    this.returnTime = function(time) {
        return moment.unix(time).format("h:mm a");
    };

    this.readjustContainerHeight = function() {
        var contentHeight = $('.common-major-main:visible > div').height()+40;
        var sidebarHeight = $('.common-major-sidebar:visible').height();
        var wrapperHeight = $('.popular-wrapper').height();
        if (app.ui.layout.isMobileClient() || $('#container').hasClass('sidebar-collapsed')) {
            var height = Math.max(contentHeight, wrapperHeight);
        } else {
            var height = Math.max(sidebarHeight, contentHeight, wrapperHeight);
        }
        $('.common-major-main').css('height', height);
    }

    this.repositionBackButton = function() {
        var height = $('.major-container-wrapper').height() + 5;
        var width = $('.social-container').width()+30;
        $('.back-to-sidebar-desktop').css('bottom', height);
        $('.back-to-sidebar-desktop').css('right', width);
    }

    this.populateContainerWithArticles = function(articles, myArticle, myUrl, notation) {
        myArticle = articles;
        $('.major-'+notation+'-sidebar').html('');
        $.each(articles, function(key,value) {
            var sidebar = '';
            var sidebarDate = '';
            var sidebarTime = '';
            var scheduledlocation = '';
            //deal with scheduled events differently
            if (notation === 'scheduled') {
                scheduledlocation = value.location;
                sidebarTime = app.major.major.returnTime(value.scheduledDate);
                sidebarDate = app.major.major.returnDate(value.scheduledDate, false);
            } else {
                sidebarDate = app.major.major.returnDate(value.postedDate, true);
            }
            sidebar +=
            '<div class="major-'+notation+'-sidebar-item">'+
                '<a href="#" class="clicker" data-item="'+ value.url+'">'+
                '<div class="timestamp"><span>'+sidebarDate[0]+'</span> <span>'+sidebarDate[1]+'</span></div>'+
                '<div class="scheduledtime"><span>'+sidebarTime+'</span></div>'+
                '<div class="holder"><div class="title">'+value.title+'</div><div class="location">'+scheduledlocation+'</div></div>'+
                '</a></div>'+
            '<div class="separator"></div>';
            $('.major-'+notation+'-sidebar').append(sidebar);
        });
        $('.clicker').on('click', function(e) {
            e.preventDefault();
            $('.major-'+notation+'-sidebar-item').removeClass('active');
            $(this).parent('.major-'+notation+'-sidebar-item').addClass('active');
            var itemUrl = $(this).attr('data-item');
            //not working
            if (app.ui.layout.isMobileClient() || $('#container').hasClass('sidebar-collapsed')) {
                $(this).closest('.major-'+notation+'-sidebar').hide();
                $(this).closest('.major-'+notation+'-sidebar').siblings('.major-'+notation+'-main').show();
            }
            myArticle.filter(function(item) {
                return item.url == itemUrl;
            }).map(function(item) {
                app.major.major.displayContent(item.url, notation);
            });
            //working
        });
        if ($('#container').hasClass('sidebar-collapsed') && $('.major-'+notation+'-sidebar').is(":visible") ) {
            if ($('.major-'+notation+'-sidebar > .major-'+notation+'-sidebar-item').length == 1) {
                app.major.major.selectContainer(myUrl, notation);
            } else {
                $('.major-'+notation+'-main').hide();
            }
        } else {
            app.major.major.shouldISelectContainer(myUrl, notation);
        }
        $('.back-to-sidebar-'+notation+', .back-to-sidebar-desktop-'+notation).on('click', function() {
            $('.major-'+notation+'-main').hide();
            $('.major-'+notation+'-sidebar').show();
        });
    };

    this.displayContent = function (burl, notation) {
        //store in myArticle for each tab
        if (notation === 'news') {
            this.newsUrl = burl;
        } else if (notation === 'relief') {
            this.reliefUrl = burl;
        } else if (notation === 'scheduled') {
            this.scheduledUrl = burl;
        }
        var aurl = burl.replace('http://em-public.ci.devcop.em.vic.gov.au/','/')
        $.ajax({
            async: false,
            type: 'GET',
            url: aurl,
            success: function(data) {
                var content = $(data).find('.main-text');
                $('.major-'+notation+'-main').find('.major-'+notation+'-static-container').html(content);
                app.major.major.readjustContainerHeight(notation);
                $('.popular-wrapper').scrollTop(0);
                util.dom.ensureExternalLinkStyles($('.main-text'));
                util.dom.responsiveElements('.common-major-main:visible','iframe, img','.major-common-static-container:visible');
            }
        });
    };

    this.shouldISelectContainer = function(myUrl, notation) {
        if ($('.major-'+notation+'-sidebar > .major-'+notation+'-sidebar-item').length == 1) {
            app.major.major.selectContainer(myUrl, notation);
        } else if ($('.major-'+notation+'-sidebar > .major-'+notation+'-sidebar-item').length >= 1) {
            if (!app.ui.layout.isMobileClient() && !$('#container').hasClass('sidebar-collapsed')) {
                app.major.major.selectContainer(myUrl, notation);
            }
        }
    };

    this.selectContainer = function(myUrl, notation) {
        if(myUrl) {
            $('[data-item="' + myUrl +'"]').click();
        } else {
            $('.major-'+notation+'-sidebar').find('a.clicker:first').click();
        }
    }

    this.swapLatLng = function(coords) {
        $.each(coords, function(key,value) {
            var b = value[1];
            value[1] = value[0];
            value[0] = b;
        });
        return coords;
    }

    this.autoExpandIncident = function() {
        this.selectedURL = util.cookies.get('local-page-id');
        var tableRow = null;
        var activePanel = null;
        var tableWarning = $("table#feature-list-0").find("[data-href='" + this.selectedURL + "']");
        var tableIncident = $("table#feature-list-1").find("[data-href='" + this.selectedURL + "']");

        //activates tab used
        if (tableWarning.length) {
            tableRow = tableWarning;
            activePanel = 'warning';
        } else if (tableIncident.length) {
            tableRow = tableIncident;
            activePanel = 'incident';
        }

        if (tableRow && tableRow.length) {
            //  prevents either table from disappearing in list mode
            if (app.ui.layout.getActiveState() === 'list' && !app.ui.layout.isMobileClient()) {
                app.ui.sidebar.showAllTabs();
            } else {
                app.ui.sidebar.showTab(activePanel);
            }
            //  selects panel and scroll into view
            tableRow.addClass('selectedPanel');
            app.ui.sidebar.scrollIntoView(tableRow);
        }
    }

    this.applyBoundingBox = function(info) {
        if (info.bbox && info.bbox.geometry && info.bbox.geometry.type && info.bbox.geometry.coordinates) {
            var bound = app.major.major.swapLatLng(info.bbox.geometry.coordinates[0]);
            var flagChange = false;

            setTimeout(function () {
                app.major.major.autoExpandIncident();
            }, 1500);

            if(this.bounds) {
                for(var i=0; i< bound.length; i++) {
                    var item = bound[i];
                    var item1 = this.bounds[i];
                    if(item[0]!= item1[0] || item[1]!= item1[1]){
                        flagChange = true;
                    }
                }
            }
            if (!this.bounds || flagChange) {
                this.bounds = bound;
                var australiaBounds = [[-10,113.2],[-80,170]];
                try{
                    app.map.fitBounds(this.bounds).setMaxBounds(australiaBounds);
                    L.mask(this.bounds).addTo(app.map);
                    this.maskExist = true;
                }
                catch(err) {
                }
                //delayed setting for minzoom and reselect feature after fitting boundarys on map
                setTimeout(function() {
                    if (app.ui.layout.isMobileClient()) {
                        app.map.options.minZoom = 5;
                    } else {
                        app.map.options.minZoom = 6;
                    }
                }, 500);
            }
        }
    };

    this.autoSelectFirstItem = function() {
        var array = [[this.newsUrl, 'news'], [this.reliefUrl,'relief'], [this.scheduledUrl,'scheduled']];
        $.each(array, function(key,value) {
            app.major.major.selectContainer(value[0], value[1])
        });
    }

    this.rename = function(name) {
        if (name == 'Response') {
            return 'respond';
        } else if (name == 'Prepare') {
            return 'prepare';
        } else if (name == 'Recovery') {
            return 'relief';
        }
    }
    this.twitterLoaded = false;
    this.fbLoaded = false;
    this.loadTwitterId = function (info) {
        if (info.additional && info.additional.twitterWidgetId && !this.twitterLoaded) {
            $('<a class="twitter-timeline" href="https://twitter.com/search?q">Tweets about Emergency Victoria</a>')
                .attr('data-widget-id', info.additional.twitterWidgetId)
                .appendTo($('#social-twitter-tab'));
            twttr.widgets.load()
            this.twitterLoaded = true;
        }
    }

    this.loadFacebookPage = function (info) {
        setTimeout(function() {
        if (info.additional && info.additional.facebook_page && !this.fbLoaded) {
            var container_width = $('#major-social-tab').width()-12;
            if (app.ui.layout.isMobileClient()) {
                container_width = $(document).width()
            };
            var facebookTemplate = app.templates.facebook({
                facebook_page: info.additional.facebook_page,
                container_width: Math.round(container_width)
            });
            $(facebookTemplate).appendTo($('#social-facebook-tab'));
            setTimeout(function () {
                FB.XFBML.parse();
            }, 300);

            this.fbLoaded = true;
        }},200);
    }

    this.initSocialFeeds = function(info) {
        this.loadTwitterId(info);
        this.loadFacebookPage(info);
    }
    this.reinitFBWidget = function (action) {
        if (!this.currentIncidentInfo || !this.currentIncidentInfo.additional.facebook_page) {
            return;
        }
        if (action) {
            var container_width = $('#social-facebook-tab').width();
        } else {
            var container_width = $('#major-social-tab').width()-12;
        }
        if (app.ui.layout.isMobileClient()) {
            container_width = $(document).width()
        }
        var facebookTemplate = app.templates.facebook({
            facebook_page: app.major.major.currentIncidentInfo.additional.facebook_page,
            container_width: container_width
        });
        $('#social-facebook-tab').html(facebookTemplate);
        setTimeout(function () {
            FB.XFBML.parse();
        }, 200);
    }

    this.filterScheduleEvents = function(pages) {
        var newPages = pages.filter(function(page) {
            return page.scheduledDate > moment().unix()
        });
        return newPages;
    }

    this.init = function(data) {
        if (data.incidentInfo && data.incidentInfo.incidentStage && data.incidentInfo.incidentStage===app.major.major.whichPage()) {
            this.currentIncidentInfo = data.incidentInfo;//
            var info = this.currentIncidentInfo;
            this.applyBoundingBox(info);
            this.initSocialFeeds(info);
            $('#major-container').removeClass('hidden');
            $('.major-incidents-page .masthead').html(info.publicName);
            if (data.pages && data.pages.news && data.pages.news.length !== 0) {
                app.major.major.populateContainerWithArticles(data.pages.news, app.major.major.newsArticles, app.major.major.newsUrl, 'news');
            }
            if (data.pages && data.pages.relief && data.pages.relief.length !== 0) {
                app.major.major.populateContainerWithArticles(data.pages.relief, app.major.major.reliefArticles, app.major.major.reliefUrl, 'relief');
            }
            if (data.pages && data.pages.scheduled) {
                var newPages = app.major.major.filterScheduleEvents(data.pages.scheduled);
                if (newPages && newPages.length !== 0) {
                    app.major.major.populateContainerWithArticles(newPages, app.major.major.scheduledArticles, app.major.major.scheduledUrl, 'scheduled');
                }
            }

            if (!app.ui.layout.isMobileClient()) {
                //tab changes
                if (this.firstTimeLoad) {
                    this.firstTimeLoad = false;
                    if (app.ui.layout.getActiveState() == 'list') {
                        app.ui.layout.setSidebarState('both');
                    }
                }
                $('.major-list-of-tabs > li > a.popular-tabs').unbind('click').on('click', function(e) {
                    e.preventDefault();
                    $('.major-list-of-tabs > li').removeClass('active');
                    $(this).parent('li').addClass('active');
                    $('.popular-wrapper > .major-all-tabs').hide();
                    var tab = $(this).attr('href');
                    $(tab).show();
                    app.major.major.repositionBackButton();
                    app.major.major.readjustContainerHeight();
                });
                //toggle container
                $('#major-container-button').unbind('click').on('click', function() {
                    $('#major-container').toggleClass('expanded-major-container');
                    $('#major-container-button .fa').toggleClass('fa-chevron-up fa-chevron-down');
                    app.major.major.repositionBackButton();
                    app.major.major.readjustContainerHeight();
                });
                //toggle social
                $('.social-toggle-button > a.lonely-tabs').unbind('click').on('click', function(e) {
                    e.preventDefault();
                    if (!$(this).hasClass('active')) {
                        $('a.lonely-tabs').toggleClass('active');
                        $('#major-social-tab > .tab-pane').toggleClass('active');
                        app.major.major.repositionBackButton();
                        app.major.major.readjustContainerHeight();
                    }
                });
                //window resize
                $( window ).resize(function() {
                    app.major.major.repositionBackButton();
                    app.major.major.readjustContainerHeight();
                });
                app.major.major.repositionBackButton();
                app.major.major.readjustContainerHeight();
            } else {
                //tab changes
                if (this.firstTimeLoad) {
                    this.firstTimeLoad = false;
                    if (app.ui.layout.getActiveState() == 'map') {
                        app.ui.layout.setSidebarState('list');
                    }
                    $('a.lonely-tabs, #major-social-tab>.tab-pane').removeClass('active');
                }
                //toggle containers
                $('.major-list-of-tabs > li > a.popular-tabs').unbind('click').on('click', function(e) {
                    e.preventDefault();
                    $('.major-list-of-tabs > li, a.lonely-tabs, #major-social-tab > .tab-pane').removeClass('active');
                    $(this).parent('li').addClass('active');
                    $('.lonely-wrapper, .major-container-wrapper > .major-all-tabs').hide();
                    $('.popular-wrapper > .major-all-tabs').hide();
                    $('.popular-wrapper').show();
                    var tab = $(this).attr('href');
                    $(tab).show();
                });
                //toggle social container
                $('.major-list-of-tabs > li > a.lonely-tabs').unbind('click').on('click', function(e) {
                    e.preventDefault();
                    if (!$(this).hasClass('active')) {
                        $('.major-list-of-tabs > li, a.lonely-tabs, #major-social-tab > .tab-pane').removeClass('active');
                        $(this).addClass('active');
                        if ($(this).find('span#twitter-feed-icon').length !== 0) {
                            $('#social-twitter-tab').addClass('active');
                        } else {
                            $('#social-facebook-tab').addClass('active');
                        }
                        $('.popular-wrapper, .major-container-wrapper > .major-all-tabs').hide();
                        $('.lonely-wrapper').show();
                        var tab = $(this).attr('href');
                        $(tab).show();
                    }
                });
                //adjust container height
                $('.common-major-main').css('min-height', $('.profile-wrapper').height());
            }
        } else {
            if (data.incidentInfo && data.incidentInfo.incidentStage) {
                var before = app.major.major.rename(app.major.major.whichPage());
                var after = app.major.major.rename(data.incidentInfo.incidentStage);
            }
            window.location = window.location.href.replace(before, after);
        }
        $('#mobile-sidebar-both-btn, #mobile-sidebar-list-btn,#mobile-sidebar-map-btn').click(function () {
            app.major.major.reinitFBWidget(false);
        });
        $(window).resize(function () {
            app.major.major.reinitFBWidget(true);
            util.dom.responsiveElements('.common-major-main:visible','iframe, img','.major-common-static-container:visible');
        });
    }

}).apply(app.major.major);
