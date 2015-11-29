'use strict';

L.TileLayer.GWC = L.TileLayer.extend({
    zeroPad: function(num, len, radix) {
        var str = num.toString(radix || 10);
        while (str.length < len) {
        str = '0' + str;
        }
        return str;
    },

    getTileUrl: function(tilePoint) {
        this._adjustTilePoint(tilePoint);
        var zoom = this._getZoomForUrl(tilePoint);
        tilePoint.y = Math.floor(Math.pow(2, zoom - 1) - 1 - tilePoint.y);
        zoom -= this.options.minZoom;
        var digits = (Math.floor(zoom / 6.0) + 1);

        return L.Util.template(this._url, L.extend({
            s: this._getSubdomain(tilePoint),
            z: this.zeroPad(zoom, 2, 10),
            dx: this.zeroPad(Math.floor(tilePoint.x / (Math.pow(2, Math.floor(1 + (zoom / 2))))), digits, 10),
            dy: this.zeroPad(Math.floor(tilePoint.y / (Math.pow(2, Math.floor(1 + (zoom / 2))))), digits, 10),
            x: this.zeroPad(tilePoint.x, digits * 2, 10),
            y: this.zeroPad(tilePoint.y, digits * 2, 10)
        }, this.options));
    }
});

L.tileLayer.gwc = function(url, options) {
    return new L.TileLayer.GWC(url, options);
};
