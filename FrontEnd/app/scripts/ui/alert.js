'use strict';

/*
Use from the main program either the following ways:
        app.ui.alert.error('Network error');
        app.ui.alert.success('Record updated successfully');
*/

var app = app || {};
app.ui = app.ui || {};
app.ui.alert = app.ui.alert || {};
(function() {

    this.closeAfterSeconds = 10;

    this.init = function() {
        $('#modal-message button.closer').on('click', {'handler': this}, function(event) {
            event.data.handler.hide();
        });
    };

    this.show = function() {
        $('#modal-message').show();
        setTimeout(this.hide, this.closeAfterSeconds * 1000);
    };

    this.hide = function() {
        $('#modal-message').hide();
    };

    this.removeStyles = function() {
        $('#modal-message bkgrnd').attr('style', 'bkgrnd');
    };
    /* center modal */
    this.centerModals = function($element) {
        var $modals;
        if ($element.length) {
            $modals = $element;
        } else {
            $modals = $('.modal-vcenter:visible');
        }
        $modals.each(function (i) {
            var $clone = $(this).clone().css('display', 'block').appendTo('body');
            var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
            top = top > 0 ? top : 0;
            $clone.remove();
            $(this).find('.modal-content').css("margin-top", top);
        });
    }
    //$('.modal-vcenter').on('show.bs.modal', function (e) {
    //    centerModals($(this));
    //});
    //$(window).on('resize', centerModals);

    this.showMessageWithStyle = function (message, style) {
        $('#modal-message .message').html(message);
        this.removeStyles();
        $('#modal-message .bkgrnd').addClass(style);
        //this.show();
        $('#modal-message').on('show.bs.modal', function (e) {
            app.ui.alert.centerModals($(this));
        });
        $('#modal-message').modal('show');
        setTimeout(function(){
            $('#modal-message').modal('hide');
        }, this.closeAfterSeconds * 1000);
    };

    // message types

    this.dataNotFound = function() {
        $('#notFoundModal').modal('show');
        setTimeout(function(){
            $('#notFoundModal').modal('hide');
        }, this.closeAfterSeconds * 1000);
    };

    this.error = function(message) {
        this.showMessageWithStyle(message, 'error');
    };

    this.success = function(message) {
        this.showMessageWithStyle(message, 'success');
    };

}).apply(app.ui.alert);
