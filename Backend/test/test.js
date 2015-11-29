var servers = [{
    // url: 'https://api.em-public.ci.devcop.em.vic.gov.au/dev',
    url: 'https://17o47gip83.execute-api.ap-northeast-1.amazonaws.com/dev',
    description: 'Published DEV API'
}, {
    url: 'https://api.em-public.ci.devcop.em.vic.gov.au/dev',
    description: 'Published DEV API (custom url)'
}, {
    url: 'http://localhost:9000/api',
    description: 'http://localhost:9000/api'
}, {
    url: '',
    description: '/ - relative to this server'
}];
var resourceTypes = [{
    path: '/user',
    description: 'Create a new user',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au',
        password: 'Test123'
    }
}, {
    path: '/user/delete',
    description: 'Delete a user',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au',
        auth: 'authcodeprovided'
    }
}, {
    path: '/user/login',
    description: 'Authenticate as a user',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au',
        password: 'Test123'
    }
}, {
    path: '/user/pwreset',
    description: 'Reset your password',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au'
    }
}, {
    path: '/user/update',
    description: 'Update a user',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au',
        auth: 'authcodeprovided',
        newFirstname: 'Michael',
        newLastname: 'Jenkins',
        newWatchZones: [{
            name: "my favourite watchzone #2",
            radius: 10000,
            latitude: 0,
            longitude: 0
        }]
    }
}, {
    path: '/user/verify',
    description: 'Verify the email address of a user',
    example: {
        email: 'michael.jenkins@vine.vic.gov.au',
        code: 'verifycodeprovided'
    }
}, {
    path: '/topic/firehose',
    description: 'New event delivered to the firehose listener',
    example: {
        Records: [{
            Sns: {
                Message: {
                    "type": "Feature",
                    "geometry": {
                        "type": "GeometryCollection",
                        "geometries": [{
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [
                                        143.86196727024264, -35.61375286683606
                                    ],
                                    [
                                        143.85807496818964, -35.6137383065206
                                    ],
                                    [
                                        143.85422778505745, -35.61421892809451
                                    ],
                                    [
                                        143.85052045126284, -35.615182888312454
                                    ],
                                    [
                                        143.84704425366778, -35.616606434368414
                                    ],
                                    [
                                        143.84388478779388, -35.618454490423055
                                    ],
                                    [
                                        143.84111985017663, -35.62068152357832
                                    ],
                                    [
                                        143.83881752275647, -35.62323266775218
                                    ],
                                    [
                                        143.83703449647547, -35.626045077515045
                                    ],
                                    [
                                        143.83581467535822, -35.62904947827332
                                    ],
                                    [
                                        143.83518809544893, -35.6321718743629
                                    ],
                                    [
                                        143.83517018522448, -35.63533537276619
                                    ],
                                    [
                                        143.83576138569407, -35.63846207738075
                                    ],
                                    [
                                        143.83694713954003, -35.641475007107005
                                    ],
                                    [
                                        143.8386982495674, -35.644299990522946
                                    ],
                                    [
                                        143.84097159763567, -35.646867490576
                                    ],
                                    [
                                        143.8437112063706, -35.64911431452415
                                    ],
                                    [
                                        143.84684961751293, -35.650985167246134
                                    ],
                                    [
                                        143.85030955296452, -35.65243400993798
                                    ],
                                    [
                                        143.85400581763167, -35.65342519101939
                                    ],
                                    [
                                        143.85784739721112, -35.653934321670164
                                    ],
                                    [
                                        143.86173969926412, -35.653948874665225
                                    ],
                                    [
                                        143.86558688239631, -35.653468491929765
                                    ],
                                    [
                                        143.86929421619092, -35.65250499332994
                                    ],
                                    [
                                        143.872770413786, -35.65108208648538
                                    ],
                                    [
                                        143.87592987965988, -35.649234784664976
                                    ],
                                    [
                                        143.87869481727714, -35.647008546937045
                                    ],
                                    [
                                        143.8809971446973, -35.64445816152168
                                    ],
                                    [
                                        143.8827801709783, -35.64164639957588
                                    ],
                                    [
                                        143.88399999209554, -35.638642472280395
                                    ],
                                    [
                                        143.88462657200483, -35.635520328953504
                                    ],
                                    [
                                        143.88464448222928, -35.632356837870596
                                    ],
                                    [
                                        143.8840532817597, -35.62922989441757
                                    ],
                                    [
                                        143.88286752791373, -35.62621650307316
                                    ],
                                    [
                                        143.88111641788637, -35.62339088044578
                                    ],
                                    [
                                        143.8788430698181, -35.62082262615849
                                    ],
                                    [
                                        143.87610346108315, -35.618575006783
                                    ],
                                    [
                                        143.87296504994083, -35.616703395302544
                                    ],
                                    [
                                        143.86950511448924, -35.61525390479366
                                    ],
                                    [
                                        143.8658088498221, -35.61426225024948
                                    ],
                                    [
                                        143.86196727024264, -35.61375286683606
                                    ]
                                ]
                            ]
                        }, {
                            "type": "Point",
                            "coordinates": [
                                143.85990733372688, -35.63384359059292
                            ]
                        }]
                    },
                    "properties": {
                        "feedType": "warning",
                        "category1": "Advice",
                        "category2": "Hazardous Material",
                        "created": "2015-11-22T05:43:00.000Z",
                        "cssClass": "advice",
                        "webBody": "<br><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"6\" face=\"sans-serif\"><strong style=\"background-color: rgb(251, 174, 27);\">Advice - All Clear</strong></font></div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\">&nbsp;</div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\" align=\"left\">&nbsp;</div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><strong><font size=\"5\"></font></strong><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Issued For: Lake Charm, Reedy Lake</strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Incident Location: REEDY LAKE </strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Incident Name: CFA - FLOOD LANE - REEDY LAKE - 1546118&nbsp;</strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Issued: 22/11/15 4:43 PM</strong></font></div></div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">This is an</span><strong style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">&nbsp;All Clear</strong><span style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">&nbsp;message being&nbsp;</span><font color=\"#000000\" size=\"2\" face=\"sans-serif\">issued by Country Fire Authority for Lake Charm, Reedy Lake.</font></div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"></font>&nbsp;</div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\">The hay stack fire on Flood Road</font><span style=\"color: rgb(0, 0, 0); font-family: sans-serif; font-size: small; line-height: 1.4;\">&nbsp;REEDY LAKE is now safe.</span></div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font face=\"sans-serif\"></font>&nbsp;</div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"><strong>This will be the final message for this incident.&nbsp;</strong></font></div></font></span></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"><strong>Safety Instructions:</strong></font></div><ul><li><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\">If you are experiencing any symptoms that may be due to exposure, seek medical advice or call '<a href=\"http://www.health.vic.gov.au/nurseoncall/about/htm\" target=\"_top\">Nurse on Call</a>' on 1300 606 024.</font></div></li></ul></font></span></div>",
                        "id": "20017058",
                        "incidentList": [{
                            "id": "1546118"
                        }],
                        "location": "Lake Charm, Reedy Lake",
                        "incidentFeatures": [{
                            "properties": {
                                "feedType": "incident",
                                "category1": "CBRNE",
                                "category2": "Hazardous Material",
                                "location": "REEDY LAKE"
                            }
                        }],
                        "updated": null
                    }
                }
            }
        }]
    }
}];
$(document).ready(function() {
    servers.forEach(function(svr) {
        $('#server').append($('<option>', {
            value: svr.url,
            text: svr.description
        }));
    });
    if (document.location.href.match(/http\:\/\/localhost\:9002/)) {
        $('#server').val('');
    }
    resourceTypes.forEach(function(res) {
        $('#resource').append($('<option>', {
            value: res.path,
            text: res.path + ' - ' + res.description
        }));
    });
    $('#resource').change(function() {
        var resource = $('#resource').val();
        var def = resourceTypes.filter(function(res) {
            return res.path === resource;
        })[0];
        $('#request').val(JSON.stringify(def.example, null, '  '));
    });
    $('#validate').click(function(evt) {
        evt.preventDefault();
        var data = $('#request').val();
        try {
            var parsed = JSON.parse(data);
            $('#response').val('Request payload is valid.');
        } catch (err) {
            $('#response').val('Request payload is NOT valid.\n\n' + JSON.stringify(err, null, '  '));
        }
    });
    $('#execute').click(function(evt) {
        evt.preventDefault();
        var server = $('#server').val();
        var request = $('#request').val();
        var resource = $('#resource').val();
        $('#response').val('Calling ' + resource + '...');
        $.ajax({
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                Accept: 'application/json'
            },
            type: 'post',
            url: server + resource,
            data: request
        }).done(function(data) {
            try {
                $('#response').val(JSON.stringify(data, null, '  '));
            } catch (err) {
                $('#response').val('Error parsing response:\n\n' + JSON.stringify([err, data], null, '  '));
            }
        }).fail(function(err) {
            $('#response').val('Error calling ' + resource + ':\n\n' + JSON.stringify(err, null, '  '));
        });
    });
    $('#reset').click(function(evt) {
        evt.preventDefault();
        $('#request').val('');
        $('#response').val('');
    });
    $('#resource').change();
});
