const express = require('express');
const bodyParser = require('body-parser');
const sqlite = require('sqlite');
const multer = require('multer');

const path = require('path');

const projects = require('./queries/projects');
const images = require('./queries/images');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function start() {
  const db = await sqlite.open('./database.sqlite');
  await db.migrate();

  app.get('/api/projects', async (req, res) => {
    res.json(await projects.getAll(db));
  });

  app.post('/api/projects', async (req, res) => {
    res.json(await projects.create(db));
  });

  app.get('/api/projects/:id', async (req, res) => {
    res.json(await projects.get(db, req.params.id));
  });

  app.patch('/api/projects/:id', async (req, res) => {
    const { project } = req.body;
    try {
      await projects.update(db, req.params.id, project);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }

    res.json({ success: true });
  });

  app.get('/api/images', async (req, res) => {
    res.json(await images.getForProject(db, req.query.projectId));
  });

  app.get('/api/images/:id', async (req, res) => {
    res.json(await images.get(db, req.params.id));
  });

  app.post('/api/images', async (req, res) => {
    const { projectId, urls } = req.body;
    try {
      await images.addImages(db, projectId, urls);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }

    res.json({ success: true });
  });

  const uploads = multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        const { projectId } = req.params;
        try {
          if (!(await projects.get(db, projectId))) {
            throw new Error('No such projectId.');
          }
          cb(null, path.join(__dirname, '..', 'uploads', projectId));
        } catch (err) {
          cb(err);
        }
      },
      filename: async (req, file, cb) => {
        try {
          const { projectId } = req.params;
          const filename = file.originalname;
          const id = await images.addImageStub(db, projectId, filename);
          const ext = path.extname(filename);
          const link = `/uploads/${projectId}/${id}${ext}`;
          await images.updateLink(db, id, link);
          cb(null, `${id}${ext}`);
        } catch (err) {
          cb(err);
        }
      },
    }),
  });

  app.post('/api/uploads/:projectId', uploads.array('images'), (req, res) => {
    res.json({ success: true });
  });

  app.get('/uploads/:projectId/:imageName', (req, res) => {
    const { projectId, imageName } = req.params;
    res.sendFile(
      path.join(
        __dirname + '/../uploads/',
        projectId,
        path.join('/', imageName)
      )
    );
  });
}

start();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../client/build'));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();
    if (req.url.startsWith('/uploads/')) return next();
    res.sendFile(path.join(__dirname + '/../client/build/index.html'));
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
