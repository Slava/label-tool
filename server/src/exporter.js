const images = require('./queries/images');
const projects = require('./queries/projects');

const path = require('path');

exports.exportProject = projectId => {
  const imgs = images.getForProject(projectId);
  const project = projects.get(projectId);

  return imgs
    .map(img => {
      const { id, originalName, labelData, labeled } = img;
      if (!labeled) return null;

      const shapes = [];
      const labels = [];

      project.form.formParts.forEach(({ id, type, name }) => {
        if (labelData.labels == null || labelData.labels == undefined) {
          console.log("No labels found for: " + id);
          return;
        }
        const things = labelData.labels[id];
        if (type === 'bbox' || type === 'polygon') {
          function transform(points) {
            if (type === 'polygon') {
              return points;
            }

            const [[x1, y1], [x2, y2]] = points;
            return [[x1, y1], [x1, y2], [x2, y2], [x2, y1]];
          }
          function sanitize([x, y]) {
            x = Math.floor(Math.max(x, 0));
            x = Math.min(x, labelData.width);
            y = Math.floor(Math.max(y, 0));
            y = Math.min(y, labelData.height);
            return [x, y];
          }
          if (things == null || things == undefined) {
            return;
          }
          things.forEach(({ points, tracingOptions }) => {
            const pts =
              tracingOptions && tracingOptions.enabled
                ? tracingOptions.trace
                : points;
            shapes.push({
              label: name,
              line_color: null,
              fill_color: null,
              points: transform(pts.map(({ lng, lat }) => [lng, lat])).map(
                sanitize
              ),
            });
          });
        } else {
          labels.push({
            label: name,
            values: things,
          });
        }
      });

      const out = {
        flags: {},
        shapes,
        labels,
        lineColor: [0, 255, 0, 128],
        fillColor: [255, 0, 0, 128],
        imagePath: originalName,
        imageData: null,
      };

      return {
        name: path.basename(originalName).replace(/\.[^/.]+$/, '') + '.json',
        contents: JSON.stringify(out, null, 2),
      };
    })
    .filter(x => !!x);
};
