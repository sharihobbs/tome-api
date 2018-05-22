'use strict'
require('dotenv').config()

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/tome-db';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-tome-db';
exports.PORT = process.env.PORT || 3001;
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3001';
exports.API_KEY = process.env.API_KEY
