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
var environmentNames = [{
    name: 'LOCAL',
    description: 'Current developer version run locally'
}, {
    name: 'develop',
    description: 'Latest committed development branch'
}, {
    name: 'QA',
    description: 'Latest QA build'
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
        email: 'mchuggyd2@mailinator.com',
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
        email: 'mchuggyd2@mailinator.com',
        auth: 'authcodeprovided',
        newFirstname: 'D',
        newLastname: 'C',
        enableNotification:true,
        newWatchZones: [{
            id : 123,
            name: "my favourite watchzone #1",
            radius: 10000,
            latitude: -38.379074,
            longitude: 141.366651,
            enableNotification:true,
            filters:  [
              {
                feedType: "warning",
                classification: "emergencywarning"
              }
            ]    
        },
        {
            id : 124,
            name: "my favourite watchzone #2",
            radius: 10000,
            latitude: 20,
            longitude: 20,
            enableNotification:false,
            filters:  [
             {
                feedType: "warning",
                classification: "evacuate"
              },
                {
                feedType: "warning",
                classification: "advice"
              },
             {
                feedType: "warning",
                classification: "watchandact"
              }
            ]
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
                            "type": "Point",
                            "coordinates": [
                                141.366651, -38.379074
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
}, {
    path: '/topic/deliver',
    description: 'Record posted to the email batch table',
    example: {
        Records: [{
            eventID: 'uniqueEventId',
            eventName: 'INSERT',
            dynamodb: {
                "batchId": {
                    "S": "Advice/Hazardous Material/20017058/2015-11-22T05:43:00.000Z/1"
                },
                "created": {
                    "S": "2015-11-27T04:07:55.037Z"
                },
                "event": {
                    "M": {
                        "category1": {
                            "S": "Advice"
                        },
                        "category2": {
                            "S": "Hazardous Material"
                        },
                        "created": {
                            "S": "2015-11-22T05:43:00.000Z"
                        },
                        "cssClass": {
                            "S": "advice"
                        },
                        "feedType": {
                            "S": "warning"
                        },
                        "id": {
                            "S": "20017058"
                        },
                        "incidentFeatures": {
                            "L": [{
                                "M": {
                                    "properties": {
                                        "M": {
                                            "category1": {
                                                "S": "CBRNE"
                                            },
                                            "category2": {
                                                "S": "Hazardous Material"
                                            },
                                            "feedType": {
                                                "S": "incident"
                                            },
                                            "location": {
                                                "S": "REEDY LAKE"
                                            }
                                        }
                                    }
                                }
                            }]
                        },
                        "incidentList": {
                            "L": [{
                                "M": {
                                    "id": {
                                        "S": "1546118"
                                    }
                                }
                            }]
                        },
                        "location": {
                            "S": "Lake Charm, Reedy Lake"
                        },
                        "webBody": {
                            "S": "<br><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"6\" face=\"sans-serif\"><strong style=\"background-color: rgb(251, 174, 27);\">Advice - All Clear</strong></font></div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\">&nbsp;</div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\" align=\"left\">&nbsp;</div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><strong><font size=\"5\"></font></strong><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Issued For: Lake Charm, Reedy Lake</strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Incident Location: REEDY LAKE </strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Incident Name: CFA - FLOOD LANE - REEDY LAKE - 1546118&nbsp;</strong></font></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"4\" face=\"sans-serif\"><strong>Issued: 22/11/15 4:43 PM</strong></font></div></div><font face=\"sans-serif\"></font> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">This is an</span><strong style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">&nbsp;All Clear</strong><span style=\"font-size: small; color: rgb(0, 0, 0); font-family: sans-serif; line-height: 18px;\">&nbsp;message being&nbsp;</span><font color=\"#000000\" size=\"2\" face=\"sans-serif\">issued by Country Fire Authority for Lake Charm, Reedy Lake.</font></div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"></font>&nbsp;</div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\">The hay stack fire on Flood Road</font><span style=\"color: rgb(0, 0, 0); font-family: sans-serif; font-size: small; line-height: 1.4;\">&nbsp;REEDY LAKE is now safe.</span></div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font face=\"sans-serif\"></font>&nbsp;</div><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"><strong>This will be the final message for this incident.&nbsp;</strong></font></div></font></span></div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"></font></span>&nbsp;</div> <div style=\"FONT-FAMILY: Tahoma,Arial,sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><span style=\"LINE-HEIGHT: 1.4; COLOR: rgb(0,0,0); FONT-SIZE: small\"><font face=\"sans-serif\"><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\"><strong>Safety Instructions:</strong></font></div><ul><li><div style=\"FONT-FAMILY: Tahoma, Arial, sans-serif; FONT-SIZE: 11px\" class=\"lineBreakFake\"><font color=\"#000000\" size=\"2\" face=\"sans-serif\">If you are experiencing any symptoms that may be due to exposure, seek medical advice or call '<a href=\"http://www.health.vic.gov.au/nurseoncall/about/htm\" target=\"_top\">Nurse on Call</a>' on 1300 606 024.</font></div></li></ul></font></span></div>"
                        }
                    }
                },
                "recipients": {
                    "L": [{
                        "S": "michael.jenkins@vine.vic.gov.au"
                    }]
                }
            }
        }]
    }
}, {
    path: '/topic/es-index',
    description: 'Record posted to the user table',
    example: {
        Records: [{
            eventID: 'uniqueEventId',
            eventName: 'INSERT',
            dynamodb: {
                "email": {
                    "S": "test21@yopmail.com"
                },
                "password": {
                    "S": "a70f1472d4b266fa594967ad60a92d48b38e41a8"
                },
                "tocVersion": {
                    "S": "V1.1"
                },
                "userid": {
                    "S": "e2afb9ac-b68c-4102-85c9-4c9eec73f635"
                },
                "watchZones": {
                    "L": [{
                        "M": {
                            "latitude": {
                                "N": "-36.61552763134924"
                            },
                            "longitude": {
                                "N": "143.7451171875"
                            },
                            "name": {
                                "S": "AAAA"
                            },
                            "radius": {
                                "N": "70000"
                            }
                        }
                    }]
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
        $('#environment').val('LOCAL');
    }
    resourceTypes.forEach(function(res) {
        $('#resource').append($('<option>', {
            value: res.path,
            text: res.path + ' - ' + res.description
        }));
    });
    environmentNames.forEach(function(res) {
        $('#environment').append($('<option>', {
            value: res.name,
            text: res.name + ' - ' + res.description
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
        var environment = $('#environment').val();
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
            url: server + '/' + environment + resource,
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
