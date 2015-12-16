'use strict';

L.Control.prototype._refocusOnMap = function (e) {
    /*
    Start accessibility
    Justification:
    When a map control is triggered, default behaviour is to set focus to the map.
    This patch overrides the _refocusOnMap function to only set focus to the map when the mouse is used.
    When triggered by the keyboard, focus should remain with the control.
    See discussion here:
    https://github.com/Leaflet/Leaflet/pull/3275/files
    */
    if (this._map && e && (e.screenX > 0) && (e.screenY > 0)) {
        this._map.getContainer().focus();
    }
    /*
    End accessibility */
};

L.Popup.prototype._initLayout = function () {
    var prefix = 'leaflet-popup';
    var containerClass = prefix + ' ' + this.options.className + ' leaflet-zoom-' + (this._animated ? 'animated' : 'hide');
    var container = this._container = L.DomUtil.create('div', containerClass);
    var closeButton;

    /* Start accessibility
    Justification:
    Make popup container programmatically focusable */
    container.tabIndex = -1;
    /* End accessibility */

    if (this.options.closeButton) {
        closeButton = this._closeButton = L.DomUtil.create('a', prefix + '-close-button', container);
        closeButton.href = '#close';

        /* Start accessibility
        Justification: Hide 'x' symbol from screen reader (reads as 'multiplication') and add meaningful text. Add button role. */
        closeButton.innerHTML = '<img class="icon-media-cross" alt="Close" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><span class="sr-only">Close popup</span>';
        closeButton.setAttribute('role', 'button');
        /* End accessibility */

        L.DomEvent.disableClickPropagation(closeButton);
        L.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
    }

    var wrapper = this._wrapper = L.DomUtil.create('div', prefix + '-content-wrapper', container);
    L.DomEvent.disableClickPropagation(wrapper);

    this._contentNode = L.DomUtil.create('div', prefix + '-content', wrapper);

    L.DomEvent.disableScrollPropagation(this._contentNode);
    L.DomEvent.on(wrapper, 'contextmenu', L.DomEvent.stopPropagation);

    this._tipContainer = L.DomUtil.create('div', prefix + '-tip-container', container);
    this._tip = L.DomUtil.create('div', prefix + '-tip', this._tipContainer);
};

L.TileLayer.prototype._createTile = function () {
    var tile = L.DomUtil.create('img', 'leaflet-tile');
    tile.style.width = tile.style.height = this._getTileSize() + 'px';
    tile.galleryimg = 'no';

    /* Start accessibility
    Justification: Set empty alt attribute on image and give role of presentation.
    Stops screen reader from reading image src attribute. */
    tile.setAttribute('alt', '');
    tile.setAttribute('role', 'presentation');
    /* End accessibility */

    tile.onselectstart = tile.onmousemove = L.Util.falseFn;

    if (L.Browser.ielt9 && this.options.opacity !== undefined) {
        L.DomUtil.setOpacity(tile, this.options.opacity);
    }
    // without this hack, tiles disappear after zoom on Chrome for Android
    // https://github.com/Leaflet/Leaflet/issues/2078
    if (L.Browser.mobileWebkit3d) {
        tile.style.WebkitBackfaceVisibility = 'hidden';
    }
    return tile;
};
