const fs = require('fs');
const path = require('path');
const sqlite3 = require('better-sqlite3');

const dbPath =
  process.env.DATABASE_FILE_PATH ||
  path.join(__dirname, '../../database.sqlite');

const exists = fs.existsSync(dbPath);
const db = sqlite3(dbPath, {});

if (!exists) {
  const migrations = path.join(path.join(__dirname, '..', '..'), 'migrations');
  const files = fs.readdirSync(migrations);
  files.sort();
  files.forEach(f => {
    if (!f.endsWith('.up.sql')) return;
    const sql = fs.readFileSync(path.join(migrations, f), 'utf8');
    db.exec(sql);
  });
}

exports.getDb = () => db;
