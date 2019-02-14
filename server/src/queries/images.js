const db = require('./db').getDb();
const path = require('path');

module.exports = {
  getForProject: projectId => {
    const images = db
      .prepare(
        `
select * from (
  select images.id, originalName, link, group_concat(labels.id) as labelsId, group_concat(labels.completed) as labelsCompleted, images.projectsId
  from images
  left join labels
        on labels.projectsId = images.projectsId and labels.imagesId = images.id
  where images.projectsId = ?
  group by images.id
)
where projectsId = ?;
`
      )
      .all(projectId, projectId);

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

  get: id => {
    const image = db
      .prepare(
        `
select *
from images
where images.id = ?;
`
      )
      .get(id);
    return image;
  },

  addImages: (projectId, urls) => {
    const getName = url =>
      path.basename(new URL(url, 'https://base.com').pathname);

    const stmt = db.prepare(`
insert into images(originalName, link, labelsCount, projectsId)
values (?, ?, 0, ?);
`);

    for (const url of urls) {
      stmt.run(getName(url), url, projectId);
    }
  },

  addImageStub: (projectId, filename) => {
    const stmt = db.prepare(`
insert into images(originalName, link, labelsCount, projectsId)
values (?, 'stub', 0, ?);
`);

    const { lastInsertRowid } = stmt.run(filename, projectId);
    return lastInsertRowid;
  },

  updateLink: (imageId, link) => {
    db.prepare(
      `
update images
   set link = ?
 where id = ?;
`
    ).run(link, imageId);
  },

  allocateUnlabeledImage: (projectId, imageId) => {
    let result = null;
    db.transaction(() => {
      if (!imageId) {
        const unmarkedImage = db
          .prepare(
            `
select images.id
from images
left join labels
on labels.imagesId = images.id
where images.projectsId = ? and labels.id is null;
`
          )
          .get(projectId);

        imageId = unmarkedImage && unmarkedImage.id;
      }

      if (!imageId) {
        result = null;
      } else {
        const labelId = db
          .prepare(
            `
insert into labels(projectsId, imagesId, completed, labelData)
values (?, ?, 0, '{}');
`
          )
          .run(projectId, imageId).lastInsertRowid;

        result = { labelId, imageId };
      }
    })();

    return result;
  },
};
