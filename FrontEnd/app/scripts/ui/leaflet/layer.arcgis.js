'use strict';

L.TileLayer.ArcGIS = L.TileLayer.extend({
    zeroPad: function(num, len, radix) {
        var str = num.toString(radix || 10);
        while (str.length < len) {
            str = '0' + str;
        }
        return str;
    },

    getTileUrl: function(tilePoint) {
        this._adjustTilePoint(tilePoint);
        return L.Util.template(this._url, L.extend({
            z: 'L' + this.zeroPad(tilePoint.z, 2, 10),
            x: 'C' + this.zeroPad(tilePoint.x, 8, 16),
            y: 'R' + this.zeroPad(tilePoint.y, 8, 16)
        }, this.options));
    }
});

L.tileLayer.arcgis = function(url, options) {
    return new L.TileLayer.ArcGIS(url, options);
};
