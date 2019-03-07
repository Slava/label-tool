const path = require('path');

const dbPath =
  process.env.DATABASE_FILE_PATH ||
  path.join(__dirname, '../../database.sqlite');
const db = require('better-sqlite3')(dbPath, {});

exports.getDb = () => db;
