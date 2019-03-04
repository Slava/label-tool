const db = require('./db').getDb();

module.exports = {
  getAll: () => {
    return db
      .prepare(
        `
select *
  from mlmodels;
`
      )
      .all();
  },
  create: model => {
    const id = db
      .prepare(
        `
insert into mlmodels(name, url, type) values (?, ?, ?);
`
      )
      .run(model.name, model.url, model.type).lastInsertRowid;

    return id;
  },
};
