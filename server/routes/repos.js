// repos.js
// WikiSearch /repos/ route

var pjson      = require('../../package.json');
var express    = require('express');
var bodyParser = require('body-parser');
var fs         = require("fs");
var path       = require('path');
var http       = require('http')
var url        = require("url");
var git        = require("nodegit");
var gitGrep    = require('git-grep');
var clim       = require("clim");

var logger    = clim("[WikiSearch-"+pjson.version+"]");

var api_router = express.Router();

var repos_path = 'server/repos/';

api_router.route('/')

  .get(function(req, res) {
    var response = {
      json: true,
      ver: 'v1',
      routes: [
        { route: 'repos',                       verb: 'GET',    params: [] },
        { route: 'repos/:repo',                 verb: 'GET',    params: [] },
        { route: 'repos/:repo',                 verb: 'PUT',    params: ['name','url','token'] },
        { route: 'repos/:repo',                 verb: 'DELETE', params: [] },
        { route: 'repos/:repo/update',          verb: 'GET',    params: [] },
        { route: 'repos/:repo/search',          verb: 'GET',    params: ['terms'] },
        { route: 'repos/:repo/updateAndSearch', verb: 'GET',    params: ['terms'] }
      ]
    };
    res.json(response);
  });

api_router.route('/repos')

  .get(function(req, res) {

    var console = clim("(GET /v1/repos):", logger);

    fs.readdir(repos_path,function(err, files){

      // return error if there was a problem reading all the repos
      if (err) {
        res.status(500);
        var response = { success: false, status: 'error getting reading all repos' };
        res.json(response);
        console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));
      }

      // otherwise create a structured response of repos
      var cloned_repos = [];
      files.forEach( function (file){
        if( /.\.json/.test(file) ) {
          var obj = JSON.parse(fs.readFileSync(repos_path + file, 'utf8'));
          cloned_repos.push(obj);
        }
      });

      // respond
      var response = cloned_repos;
      res.json(response);
      console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    });

  });

api_router.route('/repos/:repo')

  .get(function(req, res) {

    var console = clim("(GET /v1/repos/:repo):", logger);

    var repo = {
      id: req.params['repo']
    };

    // ensure the repo file exists
    var repo_exists = fs.existsSync(repos_path + repo.id + '.json');
    if(repo_exists){

      // open the associated repo file to get base information
      var repo = JSON.parse(fs.readFileSync(repos_path + repo.id + '.json', 'utf8'));

      // open the associated repo and get head and last commit info; add to obj
      git.Repository.open(path.resolve(repos_path + repo.id)).then(function (gitrepo) {

        // return repo information
        gitrepo.getHeadCommit().then(function(commit) {

          repo.head = commit.update_ref;
          repo.last_commit = {
            date:    commit.date(),
            author:  commit.author().toString(),
            message: commit.message()
          };

          var response = repo;
          res.json(response);
          console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

        });

      })
      .catch(function (reasonForFailure) {

        // return error response
        res.status(500);
        var response = { success: false, status: 'error getting repo information' };
        res.json(response);
        console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

      });

    }else{

        // return error response
        res.status(404);
        var response = { success: false, status: 'not found' };
        res.json(response);
        console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

    // res.json({ json: true, route: '/:repo', method: 'get', params: req.params, query: req.query });
  })

  .put(function(req, res) {

    var console = clim("(PUT /v1/repos/:repo):", logger);

    // check required params
    if(req.params['repo'] && req.query['name'] && req.query['url'] && req.query['token']){

      var new_repo = {
        id:    req.params['repo'],
        name:  req.query['name'],
        url:   req.query['url'],
        token: req.query['token']
      };
      //console.log(new_repo);

      // check URL
      var url_parts = url.parse(new_repo.url);

      if(/\.wiki\.git/.test(url_parts.path)){

        // path already points to the wiki

        new_repo.wiki_url = new_repo.url;
        new_repo.url = new_repo.url.replace(".wiki.git", "");

      }else if(/\.git/.test(url_parts.path)){

        // path doesn't contain a wiki but is to the git

        // update the path to include the wiki
        new_repo.wiki_url = new_repo.url.replace(".git", ".wiki.git");
        new_repo.url = new_repo.url.replace(".git", "");

      }else{

        // path doesn't contain a wiki or git

        // add .wiki.git to the url
        new_repo.wiki_url = new_repo.url + ".wiki.git";

      }

      // ensure that the repo is not already registered
      var repo_exists = fs.existsSync(repos_path + new_repo.id + '.json');
      if(!repo_exists){

        // create repos/<repo_id>.json
        fs.writeFile(repos_path + new_repo.id + '.json', JSON.stringify(new_repo),  function(err) {

          // error writing filesystem object?
          if (err) {

            res.status(500);
            var response = { success: false, status: 'error creating filesystem object' };
            res.json(response);
            console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

          }else{

            // create the credential object using the oauth token
            var cloneOptions = {};
            if(new_repo.token != 'public_repo_no_token'){
              cloneOptions.fetchOpts = {
                callbacks: {
                  credentials: function() {
                    return git.Cred.userpassPlaintextNew(new_repo.token, "x-oauth-basic");
                  }
                }
              };
            }

            // clone repo
            git.Clone(new_repo.wiki_url, repos_path + new_repo.id, cloneOptions)
            .then(function(repository) {

              // Work with the repository object here.
              var response = {};
              response[new_repo.id] = new_repo;
              res.json(response);
              console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

            },function(err){

              // clean up repo file
              fs.unlink(repos_path + new_repo.id + '.json', function(err) {

                // return error response
                res.status(500);
                var response = { success: false, status: 'error cloneing repository' };
                res.json(response);
                console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

              });

            });

          }

        });

      }else{

        // repo already exists
        res.status(400);
        var response = { success: false, status: 'object already exists' };
        res.json(response);
        console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response }));

      }

    }else{

      res.status(400);
      var response = { success: false, status: 'missing parameters' };
      res.json(response);
      console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

  })

  .delete(function(req, res) {

    var console = clim("(DELETE /v1/repos/:repo):", logger);

    var repo = {
      id: req.params['repo']
    };

    // ensure the repo file exists
    var repo_exists = fs.existsSync(repos_path + repo.id + '.json');
    if(repo_exists){

      // clean up repo file
      fs.unlink(repos_path + repo.id + '.json', function(err) {

        var path = repos_path + repo.id;
        var deleteFolderRecursive = function(path) {
          if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
              var curPath = path + "/" + file;
              if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
              } else { // delete file
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(path);
          }
        };
        deleteFolderRecursive(path);

        // return a delete confirmation
        var response = { success: true, status: 'repo deleted' };
        res.json(response);
        console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

      });

    }else{

      // return error response
      res.status(404);
      var response = { success: false, status: 'not found' };
      res.json(response);
      console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

  });

api_router.route('/repos/:repo/search')

  .post(function(req, res) {

    var console = clim("(POST /v1/repos/:repo/search):", logger);

    // check required params
    if(req.params['repo'] && req.query['terms']){

      var repo = {
        id: req.params['repo']
      };

      // ensure the repo file exists
      var repo_exists = fs.existsSync(repos_path + repo.id + '.json');
      if(repo_exists){

        // open the associated repo file to get base information
        var repo_file = JSON.parse(fs.readFileSync(repos_path + repo.id + '.json', 'utf8'));
        repo_file.terms = req.query['terms'];
        repo_file.results = [];

        // search for the terms in the repo
        gitGrep(path.resolve(repos_path + repo.id + '/.git'), {
          rev: 'HEAD',
          term: repo_file.terms
        }).on('data', function(data) {

          // and the target URL to the data obj
          data.href = repo_file.url + '/wiki/' + data.file.replace(/\.[^/.]+$/, "");
          data.href_raw = repo_file.url + '/wiki/' + data.file;

          // add results to repo obj
          repo_file.results.push(data);

        }).on('error', function(err) {

          res.status(500);
          var response = { success: false, status: 'error searching repository' };
          res.json(response);
          console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

        }).on('end', function() {

          // create and send response
          var response = repo_file;
          res.json(response);
          response.results = "[.." + response.results.length + " results returned..]";
          console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

        });


      }else{

        // return error response
        res.status(404);
        var response = { success: false, status: 'not found' };
        res.json(response);
        console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

      }

    }else{

      res.status(400);
      var response = { success: false, status: 'missing parameters' };
      res.json(response);
      console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

  });

api_router.route('/repos/:repo/update')

  .post(function(req, res) {

    var console = clim("(POST /v1/repos/:repo/update):", logger);

    var repo = {
      id:       req.params['repo']
    };

    // ensure the repo file exists
    var repo_exists = fs.existsSync(repos_path + repo.id + '.json');
    if(repo_exists){

      // open the associated repo file to get base information
      var repo_file = JSON.parse(fs.readFileSync(repos_path + repo.id + '.json', 'utf8'));

      // open local repo
      git.Repository.open(path.resolve(repos_path + repo.id)).then(function(repository) {

        // synchronously update the repo
        repository.fetchAll({}, function(err){

          if(err){

            res.status(500);
            var response = { success: false, status: 'error updating git repo' };
            res.json(response);
            console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

          }else{

            // return repo information
            repository.getHeadCommit().catch( function(err) {

              res.status(500);
              var response = { success: false, status: 'error updating repository' };
              res.json(response);
              console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

            }).then(function(commit) {

              repo_file.head = commit.update_ref;
              repo_file.datetime = Date();
              repo_file.last_commit = {
                date:    commit.date(),
                author:  commit.author().toString(),
                message: commit.message()
              };

              var response = repo_file;
              res.json(response);
              console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

            });

          }

        });

      });

    }else{

      // return error response
      res.status(404);
      var response = { success: false, status: 'not found' };
      res.json(response);
      console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

  });

api_router.route('/repos/:repo/updateAndSearch')

  .post(function(req, res) {

    var console = clim("(POST /v1/repos/:repo/updateAndSearch):", logger);

    // check required params
    if(req.params['repo'] && req.query['terms']){

      var repo = {
        id:       req.params['repo']
      };

      // ensure the repo file exists
      var repo_exists = fs.existsSync(repos_path + repo.id + '.json');
      if(repo_exists){

        // open the associated repo file to get base information
        var repo_file = JSON.parse(fs.readFileSync(repos_path + repo.id + '.json', 'utf8'));
        repo_file.terms = req.query['terms'];
        repo_file.results = [];

        // open local repo
        git.Repository.open(path.resolve(repos_path + repo.id)).then(function(repository) {

        // synchronously update the repo
        repository.fetchAll({}, function(err){

          if(err){

            res.status(500);
            var response = { success: false, status: 'error updating git repo' };
            res.json(response);
            console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

          }else{

            // return repo information
            repository.getHeadCommit().catch( function(err) {

              // return an error if there was a problem getting commit information
              res.status(500);
              var response = { success: false, status: 'error updating repository' };
              res.json(response);
              console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

              }).then(function(commit) {

                repo_file.head = commit.update_ref;
                repo_file.datetime = Date();
                repo_file.last_commit = {
                  date:    commit.date(),
                  author:  commit.author().toString(),
                  message: commit.message()
                };

                // search for the terms in the repo
                gitGrep(path.resolve(repos_path + repo.id + '/.git'), {
                  rev: 'HEAD',
                  term: repo_file.terms
                }).on('data', function(data) {

                  // and the target URL to the data obj
                  data.href = repo_file.url + '/wiki/' + data.file.replace(/\.[^/.]+$/, "");
                  data.href_raw = repo_file.url + '/wiki/' + data.file;

                  // add results to repo obj
                  repo_file.results.push(data);

                }).on('error', function(err) {

                  res.status(500);
                  var response = { success: false, status: 'error searching repository' };
                  res.json(response);
                  console.error(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: err }));

                }).on('end', function() {

                  // create and send response
                  var response = repo_file;
                  res.json(response);
                  response.results = "[.." + response.results.length + " results returned..]";
                  console.info(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

                });

              });

            }

          });

        });

      }else{

        // return error response
        res.status(404);
        var response = { success: false, status: 'not found' };
        res.json(response);
        console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

      }

    }else{

      res.status(400);
      var response = { success: false, status: 'missing parameters' };
      res.json(response);
      console.warn(JSON.stringify({ request: { params: req.params, query: req.query }, response: response, error: null }));

    }

  });

// export repos router
module.exports = api_router;