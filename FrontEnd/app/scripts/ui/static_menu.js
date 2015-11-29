'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.staticMenu = app.ui.staticMenu || {};

(function() {
    this.init = function() {
        $('#static-content .accordion-menu .item a').on('click', function() {
            $('#static-content .accordion-menu .item').removeClass('active');
            $(this).parent().addClass('active');
        });

        $('#static-content .accordion-menu .panel-heading a').on('click', function() {
            $('#static-content .accordion-menu .panel-heading').removeClass('active-main');
            $(this).parent().parent().addClass('active-main');
        });
    };

}).apply(app.ui.staticMenu);
