'use strict';

/* globals app: false */
/* globals moment: false */

var util = util||{};
util.fdr = util.fdr || {};

(function() {
    this.initFdrDistrictPage = function() {
        util.fdr.initGeneral();
        var vars = util.fdr.getUrlVars();
        var districtId = 1*vars.districtId;
        if (districtId>=1) {
            var districtIndex = districtId-1;
            util.fdr.getFdrData(function(resultObj) {
                var params = resultObj;
                params.districtIndex = districtIndex;
                params.districtIndexStr = ''+districtIndex;
                params.districtName = resultObj.error ? '' : resultObj.days[0].declareList[districtIndex].name;
                var html = app.templates['fdr-details'](params);
                $('.fdr-details').html(html);
                if (!resultObj.error) {
                    $('.district-labels li').hide();
                    $('.district-labels li.' + util.fdr.getDistrictClassName(districtIndex)).show();
                    util.fdr.adjustTFBIcons(resultObj);
                }
            }, districtIndex);
        }
    };

    this.getUrlVars = function () {
        var vars = {}, hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars[hash[0]] = hash[1];
        }
        return vars;
    };

    this.getDistrictClassName = function(districtIndex) {
        var names = [
            'mallee',
            'wimmera',
            'southwest',
            'northerncountry',
            'northcentral',
            'central',
            'northeast',
            'southandwestgipps',
            'eastgipps'
        ];
        return names[districtIndex];
    };

    this.getDistrictStatus = function(status) {
        var code=0;
        if (status!==null) {
            var validNames = [
                'NO FORECAST',
                'LOW-MODERATE',
                'HIGH',
                'VERY HIGH',
                'SEVERE',
                'EXTREME',
                'CODE RED'
            ];
            code = validNames.indexOf(status);
        }
        if (code<0) {
            throw new Error('Unknown district status: ' + status);
        }
        return code;
    };

    this.getDistrictName = function(name) {
        var validNames = [
            'Mallee',
            'Wimmera',
            'South West',
            'Northern Country',
            'North Central',
            'Central',
            'North East',
            'West and South Gippsland',
            'East Gippsland'
        ];
        var newName = null;
        if (validNames.indexOf(name)>=0) {
            newName = name.toLowerCase().replace(/ /g, '_');
        }
        return newName;
    };

    this.adjustTFBIcons = function(resultObj) {
        $('.total-fire-ban-icons img').hide();
        for ( var dayIndex=0; dayIndex<5; dayIndex++ ) {
            for ( var districtIndex=0; districtIndex<resultObj.days[dayIndex].declareList.length; districtIndex++) {
                if (resultObj.days[dayIndex].declareList[districtIndex].isTotalFireBan) {
                    var selector='.day-' + dayIndex + ' .image-map-container .total-fire-ban-icons .' + util.fdr.getDistrictClassName(districtIndex);
                    $(selector).show();
                }
            }
        }
    };

    this.getFdrUrl = function() {
        var url = '';
        if( util.feature.toggles.testdata ) {
            url = 'data/osom-fdrtfb.json';
        } else { // live data
            url = '/public/osom-fdrtfb.json';
        }
        return url;
    };

    this.getFdrData = function(callback, selectedDistrictIndex) {
        var url = util.fdr.getFdrUrl();
        $.ajax(url, {
            dataType: 'json',
            success: function(data) {
                var resultObj;
                try {
                    var filteredData = [];
                    for ( var dayIndex=0; dayIndex<5; dayIndex++ ) {
                        var declareList = [];
                        var imageNames = [];
                        var selectedDistrictsDeclare = null;
                        var isData = false;
                        for ( var districtIndex=0; districtIndex<data.results[dayIndex].declareList.length; districtIndex++) {
                            var fdrRecord = util.fdr.getFdrRecord(data, dayIndex, districtIndex);
                            if (fdrRecord.fdr) {
                                isData = true;
                            }
                            var fdrStatus = fdrRecord.fdr ? util.fdr.formatText(fdrRecord.fdr.status) : 'NO DATA';
                            var tfbStatus = fdrRecord.tfb ? util.fdr.formatText(fdrRecord.tfb.status) : null;
                            var isTotalFireBan = (fdrRecord.tfb && (fdrRecord.tfb.status.substr(0,3).toLowerCase() === 'yes'));
                            var districtDeclare = {
                                name: data.results[dayIndex].declareList[districtIndex].name,
                                isData: isData,
                                tfbStatus: tfbStatus,
                                fdrStatus: fdrStatus,
                                index: districtIndex+1,
                                fdrClassName: util.fdr.getFdrClassName(fdrStatus),
                                detailedDistrictImageName: util.fdr.getDetailedDistrictImgName(fdrRecord.tfb, fdrRecord.fdr, isTotalFireBan),
                                isTotalFireBan: isTotalFireBan
                            };
                            declareList[districtIndex] = districtDeclare;
                            imageNames.push(util.fdr.getDistrictImgName(fdrRecord.tfb, fdrRecord.fdr));
                            if (districtIndex===selectedDistrictIndex) {
                                selectedDistrictsDeclare = districtDeclare;
                            }
                        }
                        var oneDayData = {
                            isData: isData,
                            totalFireBan: data.results[dayIndex],
                            fireDangerRating: data.results[dayIndex+5],
                            declareList: declareList,
                            imageNames: imageNames,
                            issueAt: data.results[dayIndex+5] ?
                                moment(data.results[dayIndex+5].issueAt, 'DD/MM/YYYY HH:mm:ss').format('ddd, DD MMM YYYY hh:mm:ss A') :
                                null,
                            selectedDistrictsDeclare: selectedDistrictsDeclare
                        };
                        filteredData.push(oneDayData);
                    }
                    resultObj = {days: filteredData};
                } catch (ex) {
                    resultObj = {
                        error: true,
                        errorMessage: ex.message
                    };
                }
                callback(resultObj);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var resultObj = {
                    error: true,
                    errorMessage:
                        'A problem with loading FDR data JSON occurred. status=' +
                        jqXHR.status + ' ' + jqXHR.statusText + ', ' + textStatus + ' ' + (errorThrown.message||'')
                };
                callback(resultObj);
            }
        });
    };

    this.getFdrRecord = function(data, dayIndex, districtIndex) {
        var tfb = null;
        var fdr = null;
        if (data.results[dayIndex] && data.results[dayIndex].declareList[districtIndex]) {
            tfb = data.results[dayIndex].declareList[districtIndex];
        }
        if (data.results[dayIndex+5] && data.results[dayIndex+5].declareList[districtIndex]) {
            fdr = data.results[dayIndex+5].declareList[districtIndex];
        }
        return {
            tfb: tfb,
            fdr: fdr
        };
    };

    this.formatText = function(str) {
        if (str===null) {
            return null;
        }
        var lower = str.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    };

    this.getFdrClassName = function(status) {
        var ret = ('' + status).toLowerCase().replace(/[^a-z]/, '');
        return ret;
    };

    this.getDetailedDistrictImgName = function(tfb, fdr, isTotalFireBan) {
        var suffix = isTotalFireBan ? '_tfb.gif' : '.gif';
        var imgFileName = util.fdr.getDistrictName(tfb.name) + '_' + util.fdr.getDistrictStatus(fdr ? fdr.status : null) + suffix;
        return imgFileName;
    };

    this.getDistrictImgName = function(tfb, fdr) {
        var imgFileName = util.fdr.getDistrictName(tfb.name) + '_' + util.fdr.getDistrictStatus(fdr ? fdr.status : null) + '.png';
        return imgFileName;
    };

    this.initGeneral = function() {
        util.feature.init({
            testdata: false
        });

    };

    this.initFireDangerRatings = function() {
        util.fdr.initGeneral();
        util.fdr.getFdrData(function(resultObj) {
            var params = resultObj;
            params.urlInlet = window.location.search ? window.location.search + '&' : '?';
            var html = app.templates.fdr(params);
            $('.fire-danger-ratings').html(html);
            if (!resultObj.error) {
                util.fdr.adjustTFBIcons(resultObj);
            }
        });
    };
}).apply(util.fdr);
