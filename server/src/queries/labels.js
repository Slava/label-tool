const db = require('./db').getDb();

module.exports = {
  get: id => {
    const label = db
      .prepare(
        `
select *
from labels
where id = ?;
`
      )
      .get(id);
    return label;
  },
};
