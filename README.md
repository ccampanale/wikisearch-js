WikiSearch-API
==============

[![Build Status](https://travis-ci.org/ccampanale/wikisearch-js.svg?branch=master)](https://travis-ci.org/ccampanale/wikisearch-js)

WikiSearch is a RESTful API written in NodeJS that provides search functionality for Github based repository wikis. It does this by locally cloning the repository wiki and allowing that repository to be updated and searched.

**Note:** This project is working but still under heavy development. Use/deploy at your own risk!

Installation
------------

Clone repo locally, `npm install`, then run server at `./server/app.js`.

```bash
$ mkdir wikisearch
$ git clone https://github.com/ccampanale/wikisearch-js wikisearch
$ cd wikisearch
$ npm install
$ npm start                    # for more verbose set DEBUG: $ DEBUG=true npm start
```

API routes can be listed at `http://localhost:3000/v1/` and the UI is available over `http://localhost:3000/ui/` (server will forward to `/ui/` for requests at the root).

Configuration
-------------

Configuration can be done via environment variables or a local `config.json` file in the root of the project. The following configuration items can be configured:

  - `config.debug` (environment: `DEBUG`): true or false to debug requests
  - `config.server.port` (environment: `PORT`): the port the application is to run on.
  - `config.repos.path` (environment: `REPO_PATH`): the path to where repos should be cloned and manged.

Tests
-----

Tests are done using **Mocha** which is expected to be installed globally:

```bash
$ npm install -g mocha@2.3.1
$ npm test                    # for more verbose set DEBUG: $ DEBUG=true npm test
```

Todo
----

  - ~~add proper configuration capabiltiies~~
  - enhance regular expressions in `PUT /v1/repos/:repo` route
  - ~~break out routes from `app.js` to a `server/routes/` directory~~
  - ~~include optional params from body instead of just from req.query~~
  - include Github oauth integration for UI
    - This currently only handled by doing checks against the Github/Enterprise API to validate the repo and token provided. No oauth authorizeation/generation is handled in the UI.
  - UI reactive design enhancements
  - add some authentication/authorization capability (ACLs, LDAP, etc.)
  - better error handling
  - code restructoring to clean some things up
    - ~~clean up logging using debug setting~~
  - expand tests
    - include some failure tests to ensure bad route requests are appropriately handled


Authors
-------

  - Christopher Campanale

Contributors
------------

  - Christopher Campanale

*If you would like to contribute to this project please fork and submit a pull request with your additions. Please detail your changes, update the changelog in the readme, and add/modify and mocha tests necessary.*

Change Log
----------

  - ***[master/head]***
  - **v0.1.2**
    - Adds `REPO_PATH` setting to configure where repos are cloned and managed.
  - **v0.1.1**
    - UI enchancements/bug fixes
    - Adds ability to optionally read configuration from `config.json` file
    - Adds `DEBUG` setting: `DEBUG=true npm start`
    - Adds `PORT` setting
  - **v0.1.0** - First beta release
