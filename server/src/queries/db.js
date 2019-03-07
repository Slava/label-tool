const path = require('path');
const dbPath = path.join(__dirname, '../../database.sqlite');
const db = require('better-sqlite3')(dbPath, {});

exports.getDb = () => db;
