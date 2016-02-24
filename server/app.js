// app.js
// WikiSearch entry

var pjson      = require('../package.json');
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var path       = require('path');
var clim       = require("clim");

var logger    = clim("[WikiSearch-"+pjson.version+"]");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;

var api_router = require('./routes/repos');
var ui_router = require('./routes/ui');

app.use('/v1', api_router);
app.use('/',   ui_router);
app.use('/ui', express.static(path.resolve('server/static')));

app.listen(port);
logger.info('WikiSearch istening on: ' + port);

// export server for testing/consumption
module.exports = app;