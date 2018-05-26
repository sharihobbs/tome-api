const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
const nock = require('nock')
const _ = require('lodash')
const {app, runServer, closeServer} = require('../server')
const {TEST_DATABASE_URL} = require('../config')

chai.use(chaiHttp);

describe('Search API resource', function() {
  const expectedBookKeys = [
    'title',
    'id',
    'authors',
    'industryIdentifiers',
    'googleId',
    'thumbnail'
  ]
  let googleMock
  let searchPage1
  let searchPage2
  let searchPage3
  let searchPage4

  before(function() {
    searchPage1 = generateSearchResults(1)
    searchPage2 = generateSearchResults(2)
    searchPage3 = generateSearchResults(3)
    searchPage4 = generateSearchResults(4)

    return runServer(TEST_DATABASE_URL);
  })

  beforeEach(function() {
    googleMock = nock('https://www.googleapis.com')
  })

  afterEach(function() {
    expect(googleMock.isDone()).to.be.true
  })

  after(function() {
    return closeServer();
  })

  describe('Search POST endpoint', function() {
    let page1BookIds = []
    let page2BookIds = []

    it('should error on empty POST', function() {
      return chai.request(app)
      .post('/api/search')
      .send({})
      .then(function(res) {
        expect(res).to.have.status(400);
        expect(res.text).to.equal('no query in request body')
      })
    })

    context('successful POST', function() {
      it('should return results with page undefined', function() {
        googleMock
        .get('/books/v1/volumes')
        .query(function(params) {
          return params.startIndex == 0
        })
        .reply(200, {items: searchPage1})

        googleMock
        .get('/books/v1/volumes')
        .query(function(params) {
          return params.startIndex == 36
        })
        .reply(200, {items: searchPage2})

        return chai.request(app)
        .post('/api/search')
        .send({query: 'Javascript'})
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array')
          expect(res.body.length).to.be.at.least(50)
          _.map(res.body, book => {
            expect(book).to.include.keys(expectedBookKeys)
          })
          page1BookIds = _.map(res.body, 'googleId')
        })
      })

      it('should return results for page 2', function() {
        googleMock
        .get('/books/v1/volumes')
        .query(function(params) {
          return params.startIndex == 72
        })
        .reply(200, {items: searchPage3})

        googleMock
        .get('/books/v1/volumes')
        .query(function(params) {
          return params.startIndex == 108
        })
        .reply(200, {items: searchPage4})

        return chai.request(app)
        .post('/api/search')
        .send({query: 'Javascript', page: 2})
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array')
          expect(res.body.length).to.be.at.least(50)
          _.map(res.body, book => {
            expect(book).to.include.keys(expectedBookKeys)
          })
          page2BookIds = _.map(res.body, 'googleId')
          expect(page2BookIds).to.not.have.members(page1BookIds)
        })
      })
    })
  })
})

function generateSearchResults(batchNum) {
  const BATCH_SIZE = 36
  const START = (batchNum === 1) ? batchNum : batchNum * BATCH_SIZE
  let results = []
  for (let i = 0; i <= BATCH_SIZE; i++) {
    let idx = START + i
    results.push({
      'id': 'GOOGLEID' + idx,
      'volumeInfo': {
        'title': 'TITLE' + idx,
        'authors': ['AUTHOR' + idx],
        'description': 'DESCRIPTION' + idx,
        'imageLinks': {
          'thumbnail': 'THUMBNAIL' + idx
        },
        'industryIdentifiers': [{
          'type': 'ISBN_13',
          'identifier': 'ISBN' + idx
        }]
      }
    })
  }
  return results
}
