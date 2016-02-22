var chai     = require('chai');
var chaiHttp = require('chai-http');
var server   = require('../server/app');
var should   = chai.should();

chai.use(chaiHttp);

// v1 API tests
describe('v1.Repos', function() {

    it('should list ALL repos on /v1/repos GET', function(done) {
        chai.request(server)
        .get('/v1/repos')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            done();
        });
    });

    // add a new test repo
    it('should add a SINGLE repo on /v1/repos/:<repo_id> PUT', function(done) {
        chai.request(server)
        .put('/v1/repos/mocha_test_repo')
        .query({name: 'mocha test repo', url: 'https://github.com/ccampanale/test-wiki', token: 'public_repo_no_token'})
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('mocha_test_repo');
            res.body.mocha_test_repo.should.be.a('object');
            res.body.mocha_test_repo.should.have.property('id');
            res.body.mocha_test_repo.should.have.property('name');
            res.body.mocha_test_repo.should.have.property('token');
            res.body.mocha_test_repo.should.have.property('url');
            res.body.mocha_test_repo.should.have.property('wiki_url');
            res.body.mocha_test_repo.id.should.equal('mocha_test_repo');
            res.body.mocha_test_repo.name.should.equal('mocha test repo');
            res.body.mocha_test_repo.token.should.equal('public_repo_no_token');
            res.body.mocha_test_repo.url.should.equal('https://github.com/ccampanale/test-wiki');
            res.body.mocha_test_repo.wiki_url.should.equal('https://github.com/ccampanale/test-wiki.wiki.git');
            done();
        });
    });

    // get information on the test repo
    it('should list a SINGLE repo on /v1/repos/:<repo_id> GET', function(done) {
        chai.request(server)
        .get('/v1/repos/mocha_test_repo')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('url');
            res.body.should.have.property('wiki_url');
            res.body.should.have.property('token');
            res.body.should.have.property('last_commit');
            res.body.id.should.equal('mocha_test_repo');
            res.body.name.should.equal('mocha test repo');
            res.body.url.should.equal('https://github.com/ccampanale/test-wiki');
            res.body.wiki_url.should.equal('https://github.com/ccampanale/test-wiki.wiki.git');
            res.body.token.should.equal('public_repo_no_token');
            res.body.last_commit.should.be.a('object');
            res.body.last_commit.should.have.property('date');
            res.body.last_commit.should.have.property('author');
            res.body.last_commit.should.have.property('message');
            res.body.last_commit.date.should.be.a('string');
            res.body.last_commit.author.should.be.a('string');
            res.body.last_commit.message.should.be.a('string');
            done();
        });
    });

    // search the test repo
    it('should return a object with a list of search results for repo on /v1/repos/:<repo_id>/search POST', function(done) {
        chai.request(server)
        .post('/v1/repos/mocha_test_repo/search')
        .query({terms: 'codeblock'})
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('terms');
            res.body.should.have.property('results');
            res.body.results.should.be.a('array');
            res.body.results[0].should.be.a('object');
            res.body.results[0].should.have.property('file');
            res.body.results[0].should.have.property('line');
            res.body.results[0].should.have.property('text');
            res.body.results[0].should.have.property('href');
            res.body.results[0].should.have.property('href_raw');
            done();
        });
    });

    // update the test repo
    it('should return a SINGLE updated repo on /v1/repos/:<repo_id>/update POST', function(done) {
        chai.request(server)
        .post('/v1/repos/mocha_test_repo/update')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('url');
            res.body.should.have.property('wiki_url');
            res.body.should.have.property('token');
            res.body.should.have.property('datetime');
            res.body.should.have.property('last_commit');
            res.body.id.should.equal('mocha_test_repo');
            res.body.name.should.equal('mocha test repo');
            res.body.url.should.equal('https://github.com/ccampanale/test-wiki');
            res.body.wiki_url.should.equal('https://github.com/ccampanale/test-wiki.wiki.git');
            res.body.token.should.equal('public_repo_no_token');
            res.body.last_commit.should.be.a('object');
            res.body.last_commit.should.have.property('date');
            res.body.last_commit.should.have.property('author');
            res.body.last_commit.should.have.property('message');
            res.body.last_commit.date.should.be.a('string');
            res.body.last_commit.author.should.be.a('string');
            res.body.last_commit.message.should.be.a('string');
            done();
        });
    });

    // searchAndUpdate the test rep
    it('should return a SINGLE updated repo with an array of search results on /v1/repos/:<repo_id>/updateAndSearch POST', function(done) {
        chai.request(server)
        .post('/v1/repos/mocha_test_repo/updateAndSearch')
        .query({terms: 'codeblock'})
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            res.body.should.have.property('name');
            res.body.should.have.property('url');
            res.body.should.have.property('wiki_url');
            res.body.should.have.property('token');
            res.body.should.have.property('datetime');
            res.body.should.have.property('last_commit');
            res.body.should.have.property('terms');
            res.body.should.have.property('results');
            res.body.id.should.equal('mocha_test_repo');
            res.body.name.should.equal('mocha test repo');
            res.body.url.should.equal('https://github.com/ccampanale/test-wiki');
            res.body.wiki_url.should.equal('https://github.com/ccampanale/test-wiki.wiki.git');
            res.body.token.should.equal('public_repo_no_token');
            res.body.results.should.be.a('array');
            res.body.last_commit.should.be.a('object');
            res.body.last_commit.should.have.property('date');
            res.body.last_commit.should.have.property('author');
            res.body.last_commit.should.have.property('message');
            res.body.last_commit.date.should.be.a('string');
            res.body.last_commit.author.should.be.a('string');
            res.body.last_commit.message.should.be.a('string');
            done();
        });
    });

    // delete the test repo
    it('should delete a SINGLE repo on /v1/repos/:<repo_id> DELETE', function(done) {
        chai.request(server)
        .delete('/v1/repos/mocha_test_repo')
        .end(function(err, res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('success');
            res.body.should.have.property('status');
            res.body.success.should.equal(true);
            res.body.status.should.equal('repo deleted');
            done();
        });
    });

});