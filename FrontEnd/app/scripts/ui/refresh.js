'use strict';

var app = app || {};
app.ui = app.ui || {};
app.ui.refreshControl = app.ui.refreshControl || {};

/*
Refresh control for operation bar.
Provides similar functionality to scripts/ui/leaflet/control.refresh.js.
Both controls conform to a common 'interface':
- onRefreshClick()
- onPauseClick()
- setRefreshing(bool)
- setPaused(bool)
- setUpdatedDate(date)
*/
(function() {
    this._container = null;
    this._refreshButton = null;
    this._pauseButton = null;
    this.init = function() {
        var self = this;
        this._container = $('#refresh-panel');
        this._refreshButton = this._container.find('#refresh-panel-refresh');
        this._refreshButton.click(function() {
            self._onRefreshClick();
        });
        this._pauseButton = this._container.find('#refresh-panel-pause');
        this._pauseButton.click(function() {
            self._onPauseClick();
        });
    };
    this._onRefreshClick = function() {
        /* Private actions before calling public event handler */
        this.onRefreshClick();
    };
    this.onRefreshClick = function() {
        /* Controller can override this function */
    };
    this._onPauseClick = function() {
        /* Private actions before calling public event handler */
        this.onPauseClick();
    };
    this.onPauseClick = function() {
        /* Controller can override this function */
    };
    this.setRefreshing = function(value) {
        if (value) {
            this._refreshButton.addClass('refresh-loading');
            this._refreshButton.find('span:first-child').hide().attr('aria-hidden', 'true');
            this._refreshButton.find('span:last-child').show().attr('aria-hidden', 'false');
        }
        else {
            this._refreshButton.removeClass('refresh-loading');
            this._refreshButton.find('span:first-child').show().attr('aria-hidden', 'false');
            this._refreshButton.find('span:last-child').hide().attr('aria-hidden', 'true');
        }
    };
    this.setPaused = function(value) {
        this._pauseButton.removeClass('active');
        if (value) {
            this._pauseButton.addClass('active');
        }
    };
    this.setUpdatedDate = function() {
        /* Not implemented */
    };
}).apply(app.ui.refreshControl);
