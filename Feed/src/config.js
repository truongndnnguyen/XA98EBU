var util = require('util');

module.exports = function(files) {
    var config = {
        LOCAL_CACHE: true,
        REPEAT_DELAY: 60000,
        REPEAT_ENABLED: true,
        CONFIG_USE_ENVIRONMENT: false,
        LOGGING: {
            CONSOLE: true
        },
        DATASETS: [
            './aggregation/firehose',
            // './aggregation/interstate',
            './aggregation/textonly',
            './aggregation/archive',
            // './aggregation/aws-delta',
            './aggregation/prepare',
            './aggregation/relief-recovery',
            './aggregation/cap',
            './aggregation/cop-local-view',
            './dataset/ses-warning',
            './dataset/ses-ripe',
            './dataset/ses-incident',
            './dataset/osom-incident',
            './dataset/osom-warning',
            './dataset/osom-cap-warning',
            './dataset/osom-fdrtfb',
            './dataset/osom-fdr',
            './dataset/osom-prepare-fdr',
            './dataset/burn-area',
            './dataset/cop',
            './dataset/ga-earthquake',
            './dataset/bom-cap',
            './dataset/tsunami-cap',
            // './dataset/cfs-cap',
            './dataset/cfs-incident',
            './dataset/lsv-cap',
            './dataset/rfs-cap',
            './dataset/health-heat',           
            './dataset/cms'
        ]
    };

    if( files ) {
        files.forEach(function(arg){
            // console.log('DEBUG: Loaded configuration from:', arg);
            config = util._extend(config, require('../' + arg));
        });
    }

    if( config.CONFIG_USE_ENVIRONMENT ) {
        Object.keys(process.env).forEach(function(key) {
            if( key in config ) {
                var val = process.env[key];
                if( val === 'true' || val === 'false' || val.indexOf('{')===0 || val.indexOf('[') === 0) {
                    val = JSON.parse(val);
                } else if( val.indexOf('"') === 0 || val.indexOf("'")=== 0 ) {
                    val = JSON.parse(val);
                }
                config[key] = val;
            }
        });
    }

    [config.OSOM_USR, config.OSOM_PWD, config.OSOM_ENDPOINT, config.COP_ENDPOINT, config.S3_BUCKET].forEach(function(v) {
        if (!v) {
            console.log('ERROR:', ['You need to set the following environment variables:',
                'OSOM_USR', 'OSOM_PWD', 'OSOM_ENDPOINT', 'COP_ENDPOINT', 'S3_BUCKET'].join('\n'));
            process.exit(1);
        }
    });
    return config;
};
