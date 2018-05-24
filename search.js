const config = require('./config')
const books = require('google-books-search');
const Promise = require('bluebird')
const _ = require('lodash')

const SEARCH_LIMIT = 9
const options = {
    key: config.API_KEY,
    offset: 0,
    limit: SEARCH_LIMIT,
    type: 'books',
    order: 'relevance',
    lang: 'en'
};

function searchBooks(query, page) {
  options.offset = !page || page === 1 ? 0 : offsetForPage(page, SEARCH_LIMIT)
  return new Promise(function (resolve, reject) {
    books.search(query, options, function(err, results) {
      if (err) {
        return reject(err)
      } else {
        _.map(results, book => {
          console.log(options.offset, book.id, book.title, book.authors, book.industryIdentifiers)
        })
        return resolve(results)
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
