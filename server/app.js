// app.js
// WikiSearch entry

var pjson      = require('../package.json');
var config     = require('./config');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var path       = require('path');
var clim       = require('clim');

var logger    = clim("[WikiSearch-"+pjson.version+"]");
var console   = clim("(SERVER):", logger);

// load helper functions
app.helpers = require('./lib/helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// pass config to express app
app.config = config;

// check and warn for debug mode
if(app.config.debug){
  console.warn('DEBUG ON');
}

// pass config and helpers to routes
app.use(function(req,res,next){
  req.config = app.config;
  req.helpers = app.helpers;
  next();
});

var api_router = require('./routes/repos');
var ui_router = require('./routes/ui');

app.use('/v1', api_router);
app.use('/',   ui_router);
app.use('/ui', express.static(path.resolve('server/static')));

app.listen(app.config.server.port);
console.info('WikiSearch istening on: ' + app.config.server.port);

// export server for testing/consumption
module.exports = app;