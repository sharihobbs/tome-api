const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Book} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function createNewBook() {
  return {
    thumbnail: faker.image.imageURL(),
    title: faker.name.title,
    author: faker.lorem.words,
    isbn: faker.random.number,
    note: faker.lorem.text
  }
}

function seedData() {
  console.info('Seeding book data');
  const seedData = [];
  for (let i=1; i<=10; i++) {
    seedData.push(createNewBook());
  }
  return Book.insertMany(seedData);
}

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('Books API resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });


  describe('API GET endpoint', function() {

    it('should return all books in the Reading List on GET', function() {
      return chai.request(app)
      .get('/api/readinglist/books')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res).to.be.a('object');
        expect(res.body.length).to.be.above(0);
        res.body.forEach(function(item) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys(
              'id', 'thumbnail', 'title', 'author', 'isbn');
        });
      });
    });
  });

  describe('API POST endpoint', function() {

    it('should add a new book to the ReadingList on POST', function() {

      const newBook = createNewBook();

      return chai.request(app)
      .post('api/readinglist/books/add')
      .send(newBook)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys(
          'id', 'thumbnail', 'title', 'author', 'isbn', 'note');
        expect(res.body.title).to.equal(newBook.title);
        expect(res.body.id).to.not.be.null;
        expect(res.body.author).to.equal(newBook.author);
        expect(res.body.isbn).to.equal(newBook.isbn);
        return Book.findById(res.body.id);
      })
      .then(function(book) {
        expect(book.thumbnail).to.equal(newBook.thumbnail);
        expect(book.title).to.equal(newBook.title);
        expect(book.author).to.equal(newBook.author);
        expect(book.isbn).to.equal(newBook.isbn);
      });
    });
  });

  describe('API DELETE endpoint', function() {

    it('should delete a single book by id on DELETE', function() {
      let book;
      return Book.findOne()
      .then(_book => {
        book = _book;
        return chai.request(app)
        .delete(`/api/readinglist/books/remove:${book.id}`)
        .then(res => {
          expect(res).to.have.status(204);
          return Book.findById(book.id)
          .then(_book => {
            expect(_book).to.not.exist;
          });
        });
      });
    });
  });
});




// original test for wiring purposes only
// describe('API', function() {

//  it('should 200 on GET requests', function() {
//    return chai.request(app)
//      .get('/api/fooooo')
//      .then(function(res) {
//        expect(res).to.have.status(200);
//        expect(res).to.be.json;
//      });
//  });
// });















