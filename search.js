const config = require('./config')

// const API_BASE_URL = 'https://www.googleapis.com/books/v1';
const books = require('google-books-search');
const Promise = require('bluebird')

const options = {
    key: config.API_KEY,
    offset: 0,
    limit: 9,
    type: 'books',
    order: 'relevance',
    lang: 'en'
};

function searchBooks(query) {
  return new Promise(function (resolve, reject) {
    books.search(query, options, function(err, results) {
        if (err) {
            return reject(err)
        } else {
            return resolve(results)
        }
    });
  })
}

module.exports = {
  searchBooks
}
