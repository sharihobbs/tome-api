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
    it('should return results on POST', function() {
      return chai.request(app)
      .post('/api/search')
      .send({query: 'Barron\'s Mechanical Aptitude and Spatial Relations Test, 3rd edition'})
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array')
        expect(res.body.length).to.equal(9)
        res.body.forEach(book => {
          expect(book).to.include.keys(['authors', 'title', 'thumbnail', 'industryIdentifiers'])
        })
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
