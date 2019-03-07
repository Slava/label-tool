const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const archiver = require('archiver');
const request = require('request');

const path = require('path');
const fs = require('fs').promises;

const projects = require('./queries/projects');
const images = require('./queries/images');
const mlmodels = require('./queries/mlmodels');
const exporter = require('./exporter');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

app.get('/api/mlmodels', (req, res) => {
  res.json(mlmodels.getAll());
});

app.post('/api/mlmodels', (req, res) => {
  // TODO: sanitize input data
  const { model } = req.body;
  const id = mlmodels.create(model);
  res.json({
    success: true,
    id,
  });
});

app.post('/api/mlmodels/:id', (req, res) => {
  const { id } = req.params;
  const model = mlmodels.get(id);
  request
    .post(model.url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })
    .pipe(res);
});

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

app.post('/api/images', async (req, res) => {
  const { projectId, urls, localPath } = req.body;
  if (urls) {
    try {
      images.addImageUrls(projectId, urls);
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  } else if (localPath) {
    try {
      const files = await fs.readdir(localPath);
      const isImage = p =>
        ['.jpg', '.jpeg', '.png'].includes(path.extname(p).toLowerCase());
      const imagePaths = files.filter(isImage);
      if (!imagePaths.length) {
        throw new Error('The specified folder has no image files.');
      }
      //images.addImages(projectId, urls);
      for (const filename of imagePaths) {
        const id = images.addImageStub(
          projectId,
          filename,
          path.join(localPath, filename)
        );
        images.updateLink(id, { projectId, filename });
      }
    } catch (err) {
      res.status(400);
      res.json({
        message: err.message,
        code: 400,
      });
      return;
    }
    res.json({ success: true });
  } else {
    res.status(400);
    res.json({
      message: 'No urls or local path passed',
      code: 400,
    });
  }
});

app.delete('/api/images/:id', (req, res) => {
  images.delete(req.params.id);
  res.json({ success: true });
});

app.get('/api/getLabelingInfo', (req, res) => {
  let { projectId, imageId } = req.query;
  if (!projectId) {
    res.status(400);
    res.json({
      message: 'projectId required',
      code: 400,
    });
    return;
  }

  try {
    if (!imageId) {
      const ret = images.allocateUnlabeledImage(projectId, imageId);
      if (!ret) {
        res.json({
          success: true,
        });
        return;
      }
      ({ imageId } = ret);
    }

    const project = projects.get(projectId);
    const image = images.get(imageId);

    res.json({
      project,
      image,
    });
  } catch (err) {
    res.status(400);
    res.json({
      message: err.message,
      code: 400,
    });
  }
});

app.patch('/api/images/:imageId', (req, res) => {
  const { imageId } = req.params;
  const { labelData, labeled } = req.body;
  if (labelData) {
    images.updateLabel(imageId, labelData);
  }
  if (labeled !== undefined) {
    images.updateLabeled(imageId, labeled);
  }
  res.json({
    success: true,
  });
});

const uploads = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const { projectId } = req.params;
      try {
        if (!projects.get(projectId)) {
          throw new Error('No such projectId.');
        }
        const dest = path.join(__dirname, '..', 'uploads', projectId);
        try {
          await fs.mkdir(dest);
        } catch (err) {}
        cb(null, dest);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      try {
        const { projectId } = req.params;
        const filename = file.originalname;

        if (req.reference) {
          const ext = path.extname(filename);
          const name = `_reference${ext}`;
          const referenceLink = `/uploads/${projectId}/${name}`;
          projects.updateReference(projectId, referenceLink);
          cb(null, name);
        } else {
          const id = images.addImageStub(projectId, filename, null);
          const newName = images.updateLink(id, { projectId, filename });
          cb(null, newName);
        }
      } catch (err) {
        cb(err);
      }
    },
  }),
});

app.post('/api/uploads/:projectId', uploads.array('images'), (req, res) => {
  res.json({ success: true });
});

app.post(
  '/api/uploads/:projectId/reference',
  (req, res, next) => {
    req.reference = true;
    next();
  },
  uploads.single('referenceImage'),
  (req, res) => {
    res.json({ success: true });
  }
);

app.get('/uploads/:projectId/:imageName', (req, res) => {
  const { projectId, imageName } = req.params;
  const imageId = imageName.split('.')[0];
  if (imageId !== '_reference') {
    const image = images.get(imageId);
    if (image.localPath) {
      res.sendFile(image.localPath);
      return;
    } else if (image.externalLink) {
      request.get(image.externalLink).pipe(res);
      return;
    }
  }
  res.sendFile(
    path.join(__dirname + '/../uploads/', projectId, path.join('/', imageName))
  );
});

app.get('/api/projects/:projectId/export', (req, res) => {
  const archive = archiver('zip');

  archive.on('error', err => {
    res.status(500).send({ error: err.message });
  });

  res.attachment('project-export.zip');

  archive.pipe(res);

  const { projectId } = req.params;
  exporter.exportProject(projectId).forEach(({ name, contents }) => {
    archive.append(contents, { name });
  });

  archive.finalize();
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api/')) return next();
    if (req.url.startsWith('/uploads/')) return next();
    res.sendFile(path.join(__dirname + '/../../client/build/index.html'));
  });
}

const PORT = process.env.API_PORT || process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
