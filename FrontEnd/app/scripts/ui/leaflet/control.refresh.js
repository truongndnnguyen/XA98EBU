'use strict';

var app = app || {};

/*
Refresh control for leaflet map.
Provides similar functionality to scripts/ui/refresh.js.
Both controls conform to a common 'interface':
- onRefreshClick()
- onPauseClick()
- setRefreshing(bool)
- setPaused(bool)
- setUpdatedDate(date)
*/
app.RefreshControl = L.Control.extend({
    options: {
        position: 'topleft',
        refreshControl: {
        },
        pauseControl: {
        }
    },
    onRefreshClick: function() {
        /* Controller can override this function */
    },
    onPauseClick: function() {
        /* Controller can override this function */
    },
    onAdd: function (map) {
        this._map = map;
        var container = L.DomUtil.create('div', 'refresh-control leaflet-control');
        /* Updated panel */
        this._createUpdatedPanel(container);
        /* Refresh panel */
        this._createRefreshPanel(container);
        /* Set defaults */
        this.setRefreshing(false);
        this.setPaused(false);
        return container;
    },
    _onRefreshClick: function(event) {
        event.preventDefault();
        this.onRefreshClick();
        this._refocusOnMap(event); /* Must pass event parameter to _refocusOnMap so that focus returns to map on mouse click only */
    },
    _onPauseClick: function(event) {
        event.preventDefault();
        this.onPauseClick();
        this._refocusOnMap(event); /* Must pass event parameter to _refocusOnMap so that focus returns to map on mouse click only */
    },
    _createRefreshPanel: function(container) {
        var panel = L.DomUtil.create('div', 'refresh-bar', container);
        this._refreshButton = this._createRefreshButton(panel);
        this._pauseButton = this._createPauseButton(panel);
    },
    _createRefreshButton: function(container) {
        /* Button */
        var button = this._createButton(container);
        button.title = this.options.refreshControl.title;
        L.DomEvent.on(button, 'click', this._onRefreshClick, this);
        /* Refresh elements */
        this._refreshElement = this._createButtonContent(button, this.options.refreshControl.refreshContent);
        this._loadingElement = this._createButtonContent(button, this.options.refreshControl.loadingContent);
        return button;
    },
    _createPauseButton: function(container) {
        /* Button */
        var button = this._createButton(container);
        button.title = this.options.pauseControl.title;
        L.DomEvent.on(button, 'click', this._onPauseClick, this);
        this._createButtonContent(button, this.options.pauseControl.pauseContent);
        return button;
    },
    _createButton: function(container) {
        var button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        button.href = '#';
        return button;
    },
    _createButtonContent: function(button, content) {
        /* Elements are added as children so that button retains focus when triggered */
        var span = L.DomUtil.create('span', '', button);
        span.innerHTML = content;
        return span;
    },
    _createUpdatedPanel: function(container) {
        var panel = L.DomUtil.create('div', 'updated-bar', container);
        this._updatedElement = L.DomUtil.create('span', '', panel);
        this._updatedElement.innerHTML = 'Loading...';
        return panel;
    },
    _togglePresentation: function(data) {
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            item.element.style.display = item.visible ? 'block' : 'none';
            item.element.setAttribute('aria-hidden', item.visible ? 'false' : 'true');
        }
    },
    setRefreshing: function(bool) {
        this._togglePresentation([
            { element: this._loadingElement, visible: bool },
            { element: this._refreshElement, visible: !bool }
        ]);
    },
    setPaused: function(value) {
        L.DomUtil.removeClass(this._pauseButton, 'active');
        if (value) {
            L.DomUtil.addClass(this._pauseButton, 'active');
        }
    },
    setUpdatedDate: function(value) {
        this._updatedElement.innerHTML = 'Updated ' + value.format('dd/mm/yyyy HH:MM:ss');
    }
});

app.refreshControl = function(options) {
    return new app.RefreshControl(options);
};
