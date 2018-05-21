'use strict'

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const {DATABASE_URL, PORT, CLIENT_ORIGIN} = require('./config');

app.use(express.static('public'));
app.use(morgan('common'));

const {router: listRouter} = require('./listRouter');
app.use('api/readinglist', listRouter);

app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
);

// CORS - do I need this? because look above...
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

// initial config to test connection
// app.get('/api/*', (req, res) => {
//  res.json({ok: true});
// });



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

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app, runServer, closeServer};
