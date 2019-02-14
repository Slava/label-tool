const db = require('better-sqlite3')('database.sqlite', {});

exports.getDb = () => db;
