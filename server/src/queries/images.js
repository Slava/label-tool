const SQL = require("sql-template-strings");

module.exports = {
  getForProject: async (db, projectId) => {
    const images = await db.all(SQL`
select id, originalName
from images
where projectsId = ${projectId};
`);

    return images;
  }
};
