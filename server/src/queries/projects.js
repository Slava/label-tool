const db = require('./db').getDb();

module.exports = {
  getAll: () => {
    const projects = db
      .prepare(
        `
select projects.id, projects.name, projects.form, count(images.id) as imagesCount, sum(images.labeled) as labelsCount
  from projects
         left join images on projects.id = images.projectsId
 group by projects.id;
`
      )
      .all();

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form),
    }));
  },
  get: id => {
    const project = db
      .prepare(
        `
select *
  from projects
 where id = ?;
`
      )
      .get(id);

    return { ...project, form: JSON.parse(project.form) };
  },
  create: () => {
    const id = db
      .prepare(
        `
insert into projects(name, form) values ('New Project', '{ "formParts": [] }');
`
      )
      .run().lastInsertRowid;

    const project = db
      .prepare(
        `
select * from projects where id = ?;
`
      )
      .get(id);

    return {
      imagesCount: 0,
      labelsCount: 0,
      ...project,
      form: JSON.parse(project.form),
    };
  },
  update: (id, project) => {
    if (
      !project.name ||
      project.name === '' ||
      !Array.isArray(project.form.formParts)
    ) {
      throw new Error('Project must have a non-empty name and a form object.');
    }
    if (!id) {
      throw new Error('Must present a valid id.');
    }

    db.prepare(
      `
update projects
   set name = ?, form = ?
 where id = ?;
`
    ).run(project.name, JSON.stringify(project.form), id);
  },
};
