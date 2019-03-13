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
  get: id => {
    return db
      .prepare(
        `
select *
  from mlmodels
 where id = ?;
`
      )
      .all(id)[0];
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
  delete: id => {
    db.prepare(
      `
delete from mlmodels
where id = ?;
`
    ).run(id);
  },
};
