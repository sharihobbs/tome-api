const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const expect = chai.expect;

const {Book} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const TEST_BOOKS_LEN = 10

chai.use(chaiHttp);

function createNewBook() {
  return {
    thumbnail: 'THUMBNAIL_URL',
    title: 'TITLE',
    author: 'AUTHOR',
    isbn: 'ISBN',
    note: 'NOTE',
    googleId: 'ABCDEFGHI'
  }
}

function seedData() {
  console.info('Seeding book data');
  const seedData = [];
  for (let i=1; i<=TEST_BOOKS_LEN; i++) {
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
  const expectedBookKeys = [
    'id',
    'thumbnail',
    'title',
    'author',
    'isbn',
    'googleId'
  ]

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

  describe('API', function() {
   it('should 200 on GET requests', function() {
    return chai.request(app)
     .get('/api/readinglist/books')
     .then(function(res) {
       expect(res).to.have.status(200);
       expect(res).to.be.json;
    });
   });
  });

  describe('API GET endpoint', function() {
    it('should return all books in the Reading List on GET', function() {
      return chai.request(app)
      .get('/api/readinglist/books')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res.body.books.length).to.equal(TEST_BOOKS_LEN);
        res.body.books.forEach(function(item) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys(expectedBookKeys);
        });
      });
    });
  });

  describe('API POST endpoint', function() {
    it('should add a new book to the ReadingList on POST', function() {
      const newBook = createNewBook();
      return chai.request(app)
      .post('/api/readinglist/books/add')
      .send(newBook)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys(expectedBookKeys);
        expect(res.body.title).to.equal(newBook.title);
        expect(res.body.id).to.not.be.null;
        expect(res.body.author).to.equal(newBook.author);
        expect(res.body.isbn).to.equal(newBook.isbn);
        expect(res.body.googleId).to.equal(newBook.googleId);
        return Book.findById(res.body.id);
      })
      .then(function(book) {
        expect(book.thumbnail).to.equal(newBook.thumbnail);
        expect(book.title).to.equal(newBook.title);
        expect(book.author).to.equal(newBook.author);
        expect(book.isbn).to.equal(newBook.isbn);
        expect(book.googleId).to.equal(newBook.googleId);
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
        .delete(`/api/readinglist/books/remove/${book.id}`)
        .then(res => {
          expect(res).to.have.status(200);
          return Book.findById(book.id)
          .then(_book => {
            expect(_book).to.not.exist;
          });
        });
      });
    });
  });
});















