'use strict';
var app = app || {};
app.ui = app.ui || {};
app.ui.nav = app.ui.nav || {};

(function () {
    this.init = function () {

    };
    this.ensureVisibleForTrippleZero = function () {
        var profileMenu = $('#user-profile');
        var tripleZero = $('.right-top-nav').find('.triple-zero');
        var leftMenuWidth = $("#navbar ul").width() + $("#navbar ul").offset().left;
        var rightMenuWidth = $('.right-top-nav').width();
        var availableSpace = $("#navbar").width() - leftMenuWidth - rightMenuWidth;
        if (availableSpace > 260) {
            tripleZero.removeClass('hide').show();
        }
        else {
            tripleZero.addClass('hide').hide();
        }

    }
    this.updateProfileMenu = function (profile) {
        if (profile) {
            $('#user-profile').attr('data-toggle', 'dropdown').removeAttr('data-target');
            var name = profile.firstname;
            if (/^\s*$/.test(name)) {
                name = 'User';
            };

            //ensure  there is sufficient space for tripple-zero text to display?
            $('#user-profile').html(name);
            $("body").addClass('emv-authenticated'); // will add this class to control other parts of page when user logged

            if (!profile.verified) {
                $("body").addClass('emv-authenticated-not-verified');
            }
        }
        $('.right-top-nav').removeClass('hide');

        this.ensureVisibleForTrippleZero();
    }
}).apply(app.ui.nav);
