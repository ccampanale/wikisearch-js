// helpers.js
// WikiSearch helper functions

exports.consoleMessage = function(req, res, err) {
  if(req.config.debug || err){
    return JSON.stringify(
      {
        request: {
          params: req.params || null,
          query: req.query || null,
          body: req.body || null
        },
        response: res || null,
        error: err || null
      });
  }else{
    return JSON.stringify(
      {
        request: req.path || null,
        response: (res) ? true : false || null,
        error: (err || null) ? true : false || null
      });
  }
};