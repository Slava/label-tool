const SQL = require("sql-template-strings");

module.exports = {
  getAll: async db => {
    const projects = await db.all(SQL`
select projects.id, projects.name, projects.form, count(images.id) as imagesCount, count(labels.id) as labelsCount
  from projects
         left join images on projects.id = images.projectsId
         left join labels on projects.id = labels.projectsId
 group by projects.id;
`);

    return projects.map(project => ({
      ...project,
      form: JSON.parse(project.form)
    }));
  },
  get: async (db, id) => {
    const [project, ...rest] = await db.all(SQL`
select *
  from projects
  where id = ${id};
`);
    console.log(project);
    return { ...project, form: JSON.parse(project.form) };
  },
  create: async db => {
    await db.all(SQL`
insert into projects(name, form) values ('New Project', '{ "formParts": [] }');
`);
    const [project, ...rest] = await db.all(SQL`
select * from projects where id = last_insert_rowid();
`);
    return {
      imagesCount: 0,
      labelsCount: 0,
      ...project,
      form: JSON.parse(project.form)
    };
  }
};
