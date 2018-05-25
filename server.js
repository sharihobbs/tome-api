'use strict'

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const {DATABASE_URL, PORT, CLIENT_ORIGIN} = require('./config');
const {Book} = require('./models');
const {searchBooks} = require('./search')
app.use(express.static('public'));
app.use(morgan('common'));

app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
);

// GET Endpoints
app.get('/api/readinglist/books', (req, res) => {
  Book
    .find()
    .then(books => {
      res.json({
        books: books.map(
          (book) => book.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
});

// POST Endpoints
app.post('/api/readinglist/books/add', jsonParser, (req, res) => {
  const requiredFields = ['thumbnail', 'title', 'author', 'isbn'];
  for(let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Book
    .create({
      thumbnail: req.body.thumbnail,
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      note: req.body.note
    })
    .then(book => res.status(201).json(book.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: `Internal server error: ${err}`});
    });
});

app.post('/api/search', jsonParser, (req, res) => {
  if (!req.body.query) {
    return res.status(400).send('no query in request body');
  }
  searchBooks(req.body.query, req.body.page)
  .then(results => res.status(200).json(results))
  .catch(err => {
    console.error(err)
    res.status(500).json({message: `Internal server err: ${err}`})
  })
})

// DELETE Endpoints
app.delete('/api/readinglist/books/remove/:id', (req, res) => {
  Book
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(200).json({ message: 'Successful deletion' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong when deleting' });
    });
});



// *********************************************
// Server functions below...
let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

    server = app.listen(port, () => {
      console.log(`Your app is listening on port ${port}`);
      resolve(server);
    })
    .on('error', err => {
      mongoose.disconnect();
      reject(err)
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

