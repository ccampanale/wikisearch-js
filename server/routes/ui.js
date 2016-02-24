// ui.js
// WikiSearch / route which forward to the UI static files route

var pjson      = require('../../package.json');
var express    = require('express');
var clim       = require("clim");

var logger    = clim("[WikiSearch-"+pjson.version+"]");

var ui_router = express.Router();

ui_router.get('/', function(req, res) {
  logger.info(JSON.stringify({ request: '/', response: {redirect: '/ui/#', status: 301}, error: null }));
  res.redirect(301, '/ui/#');
});

// export UI router
module.exports = ui_router;