// config.js
// Configuration component that sets defaults or uses any configuration
// provided in configuration file or environment variables.

"use strict";

var pjson       = require('../package.json');
var fs          = require("fs");
var file_config = {};
var clim        = require('clim');
var logger      = clim("[WikiSearch-"+pjson.version+"]");

var console = clim("(CONF):", logger);
console.info('Loading configuration');

// Conditionally import a config file that may be at the root of the project
var config_exists = fs.existsSync('config.json');

if(config_exists){

    // found a config file
    console.info('Found local configuration file...');

    try{
        // read in the config file
        file_config = JSON.parse(fs.readFileSync('config.json'));
    }catch (e){
        console.error('Error found in configuration file: ' + e);
    }

}else{

    // found a config file
    console.info('No local configuration file found...');

}

// base config object
var config = {};

// All config options will be pulled in the order:
// file_config -> process environment -> default setting

// server settings
config.server = {};
config.server.port = process.env.PORT || 3000;

/* config test stuff
config.test = {};
config.test.setting = true;
config.test.sub_settings = {};
config.test.sub_settings.setting2 = 1337;
config.test.sub_settings.setting3 = 2674;
config.test.in_set = "testing";
*/

// override and defaults or process envrionment vars from config
function mergeConfiguration(fromObj, toObj){
    for (var property in fromObj) {
        if (fromObj.hasOwnProperty(property)) {
            // do stuff
            if(typeof fromObj[property] == 'object' && toObj.hasOwnProperty(property)){
                //sub property; recurse
                mergeConfiguration(fromObj[property], toObj[property]);
            }else if(toObj.hasOwnProperty(property)){
                toObj[property] = fromObj[property];
            }
        }
    }
}
mergeConfiguration(file_config, config);


module.exports = config;