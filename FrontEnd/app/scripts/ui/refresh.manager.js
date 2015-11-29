'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.refreshManager = app.ui.refreshManager || {};

(function() {
    this._controlArray = [];
    this.init = function(controlArray) {
        var self = this;
        this._controlArray = controlArray;

        var refresh = function() { self.onRefreshClick(); };
        var pause = function() { self.onPauseClick(); };

        for (var i = 0; i < this._controlArray.length; i++) {
            this._controlArray[i].onRefreshClick = refresh;
            this._controlArray[i].onPauseClick = pause;
        }
    };
    this.onRefreshClick = function() {
        /* Controller can override this function */
    };
    this.onPauseClick = function() {
        /* Controller can override this function */
    };
    this.setRefreshing = function(value) {
        for (var i = 0; i < this._controlArray.length; i++) {
            this._controlArray[i].setRefreshing(value);
        }
    };
    this.setPaused = function(value) {
        for (var i = 0; i < this._controlArray.length; i++) {
            this._controlArray[i].setPaused(value);
        }
    };
    this.setUpdatedDate = function(value) {
        for (var i = 0; i < this._controlArray.length; i++) {
            this._controlArray[i].setUpdatedDate(value);
        }
    };
}).apply(app.ui.refreshManager);
