const config = require('./config')
const books = require('google-books-search');
const Promise = require('bluebird')
const _ = require('lodash')

const SEARCH_LIMIT = 36
const options = {
    key: config.API_KEY,
    offset: 0,
    limit: SEARCH_LIMIT,
    type: 'books',
    order: 'relevance',
    lang: 'en'
};

function removeDuplicates(array, prop) {
  return array.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop] === pos)
  })
}

function searchBooks(query, page) {
  options.offset = !page || page === 1 ? 0 : offsetForPage(page, SEARCH_LIMIT)
  return new Promise(function (resolve, reject) {
    books.search(query, options, function(err, results) {
      let googleBooks = [];
      if (err) {
        return reject(err)
      } else {
        _.map(results, book => {
          console.log(options.offset, book.id, book.title, book.authors, book.industryIdentifiers);
        });
        googleBooks = removeDuplicates(results, results.id);
        return resolve(googleBooks.slice(0, 9));
      }
    })
  })
}

module.exports = {
  searchBooks
}

function offsetForPage (page, limit) {
  page = (_.toSafeInteger(page) && page > 0) ? page : 1
  return (page - 1) * limit
}
