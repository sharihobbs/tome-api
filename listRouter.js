'use strict'

const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const router = express.Router();

const {Book} = require('./models');


// GET Endpoints
router.get('/books', (req, res) => {
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
router.post('/books/add', (req, res) => {
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
      res.status(500).json({ message: 'Internal server error' });
    });
});


// DELETE Endpoints
router.delete('/books/remove:id', (req, res) => {
  Book
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'Successful deletion' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong when deleting' });
    });
});


module.exports = {router};
