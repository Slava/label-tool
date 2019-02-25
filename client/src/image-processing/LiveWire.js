import { dijkstra } from './Dijkstra';
const markRadius = 1; // ~9 pixels per mark
export function computePath({
  points,
  height,
  width,
  scaling = 1.0,
  imageData,
}) {
  function pointToId(x, y) {
    return (height - y) * (width * 4) + x * 4;
  }

  function idToPoint(id) {
    const x = (id % (width * 4)) / 4;
    const y = height - Math.floor(id / (width * 4));
    return { x, y };
  }

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
    ps => new Set(ps.map(({ x, y }) => pointToId(x, y)))
  );

  let minPoint, maxPoint;

  function getPaths(startingSet, startingDistances, endSet) {
    minPoint = { x: Infinity, y: Infinity };
    maxPoint = { x: -Infinity, y: -Infinity };

    for (const id of endSet) {
      const p = idToPoint(id);
      minPoint.x = Math.min(minPoint.x, p.x);
      minPoint.y = Math.min(minPoint.y, p.y);
      maxPoint.x = Math.max(maxPoint.x, p.x);
      maxPoint.y = Math.max(maxPoint.y, p.y);
    }
    for (const id of startingSet) {
      const p = idToPoint(id);
      minPoint.x = Math.min(minPoint.x, p.x);
      minPoint.y = Math.min(minPoint.y, p.y);
      maxPoint.x = Math.max(maxPoint.x, p.x);
      maxPoint.y = Math.max(maxPoint.y, p.y);
    }
    minPoint.x -= 3;
    minPoint.y -= 3;
    maxPoint.x += 3;
    maxPoint.y += 3;

    function calcCost(a, b, c, d) {
      let sum = 0;
      for (let i = 0; i < 3; i++) {
        const aveA = (imageData[a + i] + imageData[b + i]) / 2;
        const aveB = (imageData[c + i] + imageData[d + i]) / 2;
        const diff = Math.abs(aveA - aveB);
        sum += diff * diff;
      }
      return sum;
    }

    const maxCost = 1000000;
    const distanceFn = (a, b) => {
      const pa = idToPoint(a);
      const pb = idToPoint(b);

      if (pa.x === pb.x) {
        const pl1 = pointToId(pa.x - 1, pa.y);
        const pl2 = pointToId(pa.x - 1, pb.y);
        const pr1 = pointToId(pa.x + 1, pa.y);
        const pr2 = pointToId(pa.x + 1, pb.y);
        const cost = calcCost(pl1, pl2, pr1, pr2);
        return maxCost - cost;
      } else if (pa.y === pb.y) {
        const pl1 = pointToId(pa.x, pa.y - 1);
        const pl2 = pointToId(pb.x, pb.y - 1);
        const pr1 = pointToId(pa.x, pa.y + 1);
        const pr2 = pointToId(pb.x, pb.y + 1);
        const cost = calcCost(pl1, pl2, pr1, pr2);
        return maxCost - cost;
      } else {
        const p1 = pointToId(pa.x, pb.y);
        const p2 = pointToId(pb.x, pa.y);
        const cost = calcCost(p1, p1, p2, p2);
        return maxCost - Math.floor(cost / 1.414);
      }
    };

    const neighborsFn = id => {
      const p = idToPoint(id);
      const points = [];
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (!i && !j) continue;
          points.push({
            x: p.x + i,
            y: p.y + j,
          });
        }
      }
      const validPoints = points
        .filter(p => inBounds(p, height, width))
        .filter(
          p =>
            p.x >= minPoint.x &&
            p.x <= maxPoint.x &&
            p.y >= minPoint.y &&
            p.y <= maxPoint.y
        );
      return validPoints.map(p => pointToId(p.x, p.y));
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
    if (minDist > distance) {
      minDist = distance;
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
    if (!selectedPath) {
      break;
    }
    totalPath = selectedPath.path.concat(totalPath);
    pathId = selectedPath.path[0];
  }

  return totalPath
    .map(id => idToPoint(id))
    .map(({ x, y }) => ({
      x: x / scaling,
      y: y / scaling,
    }));
}

function inBounds(p, height, width) {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
}
