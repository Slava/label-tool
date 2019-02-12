const SQL = require("sql-template-strings");

module.exports = {
  getForProject: async (db, projectId) => {
    const images = await db.all(SQL`
select images.id, originalName, link, group_concat(labels.id) as labelsId, group_concat(labels.completed) as labelsCompleted
from images
left join labels
       on labels.projectsId = images.projectsId and labels.imagesId = images.id
where images.projectsId = ${projectId};
`);

    return images.map(
      ({ id, originalName, link, labelsId, labelsCompleted }) => {
        const ids = labelsId.split(",");
        const completed = labelsCompleted.split(",");

        return {
          id,
          originalName,
          link,
          labels: ids.map((id, i) => ({
            id: parseInt(id, 10),
            completed: completed[i] === "1"
          }))
        };
      }
    );
  }
};
