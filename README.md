WikiSearch-API
==============

[![Build Status](https://travis-ci.org/ccampanale/wikisearch-js.svg?branch=master)](https://travis-ci.org/ccampanale/wikisearch-js)

WikiSearch is a RESTful API written in NodeJS that provides search functionality for Github based repository wikis. It does this by locally cloning the repository wiki and allowing that repository to be updated and searched.

**Note:** This project is working but still under heavy development. Use/deploy at your own risk!

Installation
------------

Clone repo locally, `npm install`, then run server at `./server/app.js`.

```bash
mkdir wikisearch
git clone https://github.com/ccampanale/wikisearch-js wikisearch
cd wikisearch
npm install
node server/app.js
```

API routes can be listed at `http://localhost:3000/v1/` and the UI is available over `http://localhost:3000/ui/` (server will forward to `/ui/` for requests at the root).

Configuration
-------------

Other than the server port, there is no special configuration as this time but I intend to add configuration options in the future. The port can be set by setting the environment variable `PORT=<port>`.

Tests
-----

Tests are done using **Mocha** which is expected to be installed globally:

```bash
$ npm install -g mocha@2.3.1
$ mocha --timeout 10000       # cloneing, fetching, etc. can take time so a higher timeout is good here
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
  - expand tests


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
    - UI enchancements/bug fixes
  - **v0.1.0** - First beta release