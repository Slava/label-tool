import { dijkstra } from './Dijkstra';
import { readPixel, pointToId, idToPoint } from './filtering';

const markRadius = 3; // ~100 pixels per mark
export function computePath({
  points,
  height,
  width,
  sobelH,
  sobelV,
  scaling,
}) {
  const scaledPoints = points.map(({ x, y }) => ({
    x: Math.floor(x * scaling),
    y: Math.floor(y * scaling),
  }));

  const pointsSets = scaledPoints.map(({ x, y }) => {
    const points = [];
    for (let dx = -markRadius; dx <= markRadius; dx++) {
      for (let dy = -markRadius; dy <= markRadius; dy++) {
        const p = { x: x + dx, y: y + dy };
        if (inBounds(p, height * scaling, width * scaling)) {
          points.push(p);
        }
      }
    }
    return points;
  });

  const idsSets = pointsSets.map(
    ps => new Set(ps.map(({ x, y }) => pointToId(sobelH, x, y)))
  );

  //drawTestCanvas(minPoint, maxPoint, sobelV, 'test-canvas-1');
  //drawTestCanvas(minPoint, maxPoint, sobelH, 'test-canvas-2');
  let minPoint, maxPoint;

  function getPaths(startingSet, startingDistances, endSet) {
    minPoint = { x: Infinity, y: Infinity };
    maxPoint = { x: -Infinity, y: -Infinity };

    for (const id of endSet) {
      const p = idToPoint(sobelV, id);
      minPoint.x = Math.min(minPoint.x, p.x);
      minPoint.y = Math.min(minPoint.y, p.y);
      maxPoint.x = Math.max(maxPoint.x, p.x);
      maxPoint.y = Math.max(maxPoint.y, p.y);
    }
    for (const id of startingSet) {
      const p = idToPoint(sobelV, id);
      minPoint.x = Math.min(minPoint.x, p.x);
      minPoint.y = Math.min(minPoint.y, p.y);
      maxPoint.x = Math.max(maxPoint.x, p.x);
      maxPoint.y = Math.max(maxPoint.y, p.y);
    }
    minPoint.x -= 3;
    minPoint.y -= 3;
    maxPoint.x += 3;
    maxPoint.y += 3;

    const distanceFn = (a, b) => {
      const pa = idToPoint(sobelV, a);
      const pb = idToPoint(sobelV, b);

      if (pa.x !== pb.x) {
        return 256 - sobelV.data[a];
      }
      return 256 - sobelH.data[a];
    };

    const neighborsFn = id => {
      const p = idToPoint(sobelV, id);
      const points = [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 },
      ];
      const validPoints = points
        .filter(p => inBounds(p, sobelV.height, sobelV.width))
        .filter(
          p =>
            p.x >= minPoint.x &&
            p.x <= maxPoint.x &&
            p.y >= minPoint.y &&
            p.y <= maxPoint.y
        );
      return validPoints.map(p => pointToId(sobelV, p.x, p.y));
    };

    return dijkstra(startingDistances, endSet, distanceFn, neighborsFn);
  }

  let prevDistances = new Map();
  for (const id of idsSets[0]) prevDistances.set(id, 0);
  const pathsSets = [];

  for (let i = 1; i < idsSets.length; i++) {
    const paths = getPaths(idsSets[i - 1], prevDistances, idsSets[i]);
    pathsSets.push(paths);
    prevDistances = new Map();
    paths.forEach(({ id, distance }) => prevDistances.set(id, distance));
  }

  let minDist = Infinity,
    pathId;
  pathsSets[pathsSets.length - 1].forEach(({ id, distance }) => {
    minDist = Math.min(minDist, distance);
    if (minDist === distance) {
      pathId = id;
    }
  });
  let totalPath = [];
  for (let i = pathsSets.length - 1; i >= 0; i--) {
    let selectedPath = null;
    pathsSets[i].forEach(p => {
      if (p.id === pathId) {
        selectedPath = p;
      }
    });
    totalPath = selectedPath.path.concat(totalPath);
    pathId = selectedPath.path[0];
  }

  return totalPath
    .map(id => idToPoint(sobelV, id))
    .map(({ x, y }) => ({
      x: x / scaling,
      y: y / scaling,
    }));
}

function inBounds(p, height, width) {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
}
function drawTestCanvas(minPoint, maxPoint, sobel, canvasId) {
  const canvas = document.getElementById(canvasId);
  canvas.height = maxPoint.y - minPoint.y;
  canvas.width = maxPoint.x - minPoint.x;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,255)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = minPoint.x; i <= maxPoint.x; i++) {
    for (let j = minPoint.y; j <= maxPoint.y; j++) {
      const id = pointToId(sobel, i, j);
      let C = sobel.data[id];
      ctx.fillStyle = 'rgba(' + C + ',' + C + ',' + C + ',255)';
      ctx.fillRect(i - minPoint.x, canvas.height - (j - minPoint.y), 1, 1);
    }
  }
}
