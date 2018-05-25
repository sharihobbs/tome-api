const config = require('./config')
const books = require('google-books-search');
const Promise = require('bluebird')
const _ = require('lodash')

const SEARCH_LIMIT = 36
const BOOK_BATCH_LIMIT = 4

const options = {
    key: config.API_KEY,
    offset: 0,
    limit: SEARCH_LIMIT,
    type: 'books',
    order: 'relevance',
    lang: 'en'
};

function searchBooks(query, page) {
  let promises = []
  let offset = offsetForPage(page, SEARCH_LIMIT)
  for (let i = 1; i <= BOOK_BATCH_LIMIT; i++) {
    promises.push(fetchBooks(query, _.merge({}, options, {
      offset: offset
    })))
    offset = offset + SEARCH_LIMIT
  }
  return Promise.all(promises)
  .then(results => _.chain(results)
                    .flatten()
                    .uniqBy('id')
                    .value()
  )
}

function fetchBooks(query, options) {
  return new Promise(function (resolve, reject) {
    books.search(query, options, function(err, results) {
      if (err) {
        return reject(err)
      } else {
        return resolve(results)
      }
    })
  })
}

function offsetForPage(page, limit) {
  page = (_.toSafeInteger(page) && page > 0) ? page : 1
  return (page - 1) * (limit * BOOK_BATCH_LIMIT)
}

module.exports = {
  searchBooks
}
