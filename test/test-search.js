const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

describe('Search API resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  after(function() {
    return closeServer();
  });
  describe('Search POST endpoint', function() {
    let page1BookIds = []
    let page2BookIds = []
    it('should return results on POST', function() {
      return chai.request(app)
      .post('/api/search')
      .send({query: 'Javascript'})
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array')
        expect(res.body.length).to.equal(9)
        res.body.forEach(book => {
          expect(book).to.include.keys(['authors', 'title', 'thumbnail', 'industryIdentifiers'])
          page1BookIds.push(book.industryIdentifiers[0].identifier)
        })
      })
    });

    it('should return page 2 results on POST', function() {
      return chai.request(app)
      .post('/api/search')
      .send({query: 'Javascript', page: 2})
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array')
        expect(res.body.length).to.equal(9)
        res.body.forEach(book => {
          expect(book).to.include.keys(['authors', 'title', 'thumbnail', 'industryIdentifiers'])
          page2BookIds.push(book.industryIdentifiers[0].identifier)
        })
        expect(page2BookIds).to.not.have.members(page1BookIds)
      })
    });

    it('should error on empty POST', function() {
      return chai.request(app)
      .post('/api/search')
      .send({})
      .then(function(res) {
        expect(res).to.have.status(400);
        expect(res.text).to.equal('no query in request body')
      })
    });
  });
});
