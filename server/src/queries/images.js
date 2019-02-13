const SQL = require('sql-template-strings');
const path = require('path');

module.exports = {
  getForProject: async (db, projectId) => {
    const images = await db.all(SQL`
select * from (
  select images.id, originalName, link, group_concat(labels.id) as labelsId, group_concat(labels.completed) as labelsCompleted, images.projectsId
  from images
  left join labels
        on labels.projectsId = images.projectsId and labels.imagesId = images.id
  where images.projectsId = ${projectId}
  group by images.id
)
where projectsId = ${projectId};
`);

    return images.map(
      ({ id, originalName, link, labelsId, labelsCompleted }) => {
        const ids = (labelsId || '').split(',');
        const completed = (labelsCompleted || '').split(',');

        return {
          id,
          originalName,
          link,
          labels: ids.map((id, i) => ({
            id: parseInt(id, 10),
            completed: completed[i] === '1',
          })),
        };
      }
    );
  },

  get: async (db, id) => {
    const [image, ...rest] = await db.all(SQL`
select *
from images
where images.id = ${id}
`);
    return image;
  },

  addImages: async (db, projectId, urls) => {
    const getName = url =>
      path.basename(new URL(url, 'https://base.com').pathname);
    for (const url of urls) {
      await db.all(SQL`
insert into images(originalName, link, labelsCount, projectsId)
values (${getName(url)}, ${url}, 0, ${projectId});
`);
    }
  },

  addImageStub: async (db, projectId, filename) => {
    const sql = SQL`
insert into images(originalName, link, labelsCount, projectsId)
values (${filename}, 'stub', 0, ${projectId});
`;
    const stmt = await db.prepare(sql.sql);

    return new Promise((resolve, reject) => {
      const params = [
        ...sql.values,
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        },
      ];
      stmt.stmt.run.apply(stmt.stmt, params);
    });
  },

  updateLink: async (db, imageId, link) => {
    await db.all(SQL`
update images
   set link = ${link}
 where id = ${imageId};
`);
  },
};
