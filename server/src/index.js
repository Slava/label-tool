const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const path = require('path');

const projects = require('./queries/projects');
const images = require('./queries/images');
const labels = require('./queries/labels');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/projects', (req, res) => {
  res.json(projects.getAll());
});

app.post('/api/projects', (req, res) => {
  res.json(projects.create());
});

app.get('/api/projects/:id', (req, res) => {
  res.json(projects.get(req.params.id));
});

app.patch('/api/projects/:id', (req, res) => {
  const { project } = req.body;
  try {
    projects.update(req.params.id, project);
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

app.get('/api/images', (req, res) => {
  res.json(images.getForProject(req.query.projectId));
});

app.get('/api/images/:id', (req, res) => {
  res.json(images.get(req.params.id));
});

app.post('/api/images', (req, res) => {
  const { projectId, urls } = req.body;
  try {
    images.addImages(projectId, urls);
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

app.get('/api/getLabelingInfo', (req, res) => {
  let { projectId, imageId, labelId } = req.query;
  if (!projectId) {
    res.status(400);
    res.json({
      message: 'projectId required',
      code: 400,
    });
    return;
  }

  try {
    if (!imageId || !labelId) {
      const ret = images.allocateUnlabeledImage(projectId, imageId);
      if (!ret) {
        res.status(400);
        res.json({
          message: 'no such imageId',
          code: 400,
        });
        return;
      }
      ({ imageId, labelId } = ret);
    }

    const project = projects.get(projectId);
    const image = images.get(imageId);
    const label = labels.get(labelId);

    res.json({
      project,
      image,
      label,
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

const uploads = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { projectId } = req.params;
      try {
        if (!projects.get(projectId)) {
          throw new Error('No such projectId.');
        }
        cb(null, path.join(__dirname, '..', 'uploads', projectId));
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const { projectId } = req.params;
        const filename = file.originalname;
        const id = images.addImageStub(projectId, filename);
        const ext = path.extname(filename);
        const link = `/uploads/${projectId}/${id}${ext}`;
        images.updateLink(id, link);
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
    path.join(__dirname + '/../uploads/', projectId, path.join('/', imageName))
  );
});

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
