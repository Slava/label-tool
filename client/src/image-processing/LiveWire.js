import { dijkstra } from './Dikstra';
import { readPixel, pointToId, idToPoint } from './filtering';

const markRadius = 1; // ~100 pixels per mark
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

  const startingSet = idsSets[0];
  const endSet = idsSets[1];
  const aveDst = { x: 0, y: 0 };
  const minPoint = { x: Infinity, y: Infinity };
  const maxPoint = { x: -Infinity, y: -Infinity };

  for (const id of endSet) {
    const p = idToPoint(sobelV, id);
    minPoint.x = Math.min(minPoint.x, p.x);
    minPoint.y = Math.min(minPoint.y, p.y);
    maxPoint.x = Math.max(maxPoint.x, p.x);
    maxPoint.y = Math.max(maxPoint.y, p.y);
    aveDst.x += p.x;
    aveDst.y += p.y;
  }
  aveDst.x /= endSet.size;
  aveDst.y /= endSet.size;
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

  const startingDistances = new Map();
  for (const id of startingSet) startingDistances.set(id, 0);
  const distanceFn = (a, b) => {
    const pa = idToPoint(sobelV, a);
    const pb = idToPoint(sobelV, b);

    if (pa.x !== pb.x) {
      return 256 - sobelV.data[a];
    }
    return 256 - sobelH.data[a];
  };

  const estDistanceFn = id => {
    const { x, y } = idToPoint(sobelV, id);
    return Math.abs(x - aveDst.x) + Math.abs(y - aveDst.y);
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

  const paths = dijkstra(
    startingDistances,
    endSet,
    distanceFn,
    neighborsFn,
    estDistanceFn
  );
  let minDist = Infinity;
  paths.forEach(path => (minDist = Math.min(minDist, path.distance)));
  console.log(minDist);
  return paths
    .filter(({ distance }) => distance === minDist)
    .map(({ path }) => {
      return path
        .map(id => idToPoint(sobelV, id))
        .map(({ x, y }) => ({
          x: x / scaling,
          y: y / scaling,
        }));
    });
}

function inBounds(p, height, width) {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
}
