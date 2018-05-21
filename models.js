'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bookSchema =  mongoose.Schema({
  thumbnail: {type: String, required: true},
  title: {type: String, required: true},
  author: {type: String, required: true},
  isbn: {type: String, required: true},
  note: {type: String, required: false}
 });

bookSchema.methods.serialize = function() {
  return {
    id: this._id,
    thumbnail: this.thumbnail,
    title: this.title,
    author: this.author,
    isbn: this.isbn,
    note: this.note
  };
}

const Book = mongoose.model('Book', bookSchema);

module.exports = {Book};
