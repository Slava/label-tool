const SQL = require("sql-template-strings");

module.exports = {
  getAll: async db => {
    return await db.all(SQL`
select projects.id, projects.name, projects.form, count(images.id) as imagesCount, count(labels.id) as labelsCount
  from projects
         left join images on projects.id = images.projectsId
         left join labels on projects.id = labels.projectsId
 group by projects.id;
`);
  }
};
