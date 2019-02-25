import { MinHeap } from './MaxHeap';

export function dijkstra(startingDistances, endSet, distanceFn, neighborsFn) {
  const queue = new MinHeap((a, b) => a - b);
  const fromId = new Map();

  const finalDistances = new Map();
  for (const [id, dist] of startingDistances) {
    queue.set(id, dist);
    finalDistances.set(id, dist);
  }

  const startTime = new Date();
  const leftSet = new Set(endSet.entries());
  while (!queue.empty() && leftSet.size > 0) {
    const id = queue.minElementId();
    const dist = queue.get(id);
    queue.remove(id);

    if (leftSet.has(id)) {
      leftSet.delete(id);
    }

    neighborsFn(id).forEach(nid => {
      const ndist = finalDistances.has(nid)
        ? finalDistances.get(nid)
        : Infinity;
      const delta = distanceFn(id, nid);
      if (dist + delta <= ndist) {
        queue.set(nid, dist + delta);
        finalDistances.set(nid, dist + delta);

        if (endSet.has(nid)) {
          leftSet.add(nid);
        }

        fromId.set(nid, id);
      }
    });
  }

  return Array.from(endSet).map(id => {
    const path = [];
    let curId = id;
    while (curId !== null) {
      path.push(curId);
      curId = fromId.has(curId) ? fromId.get(curId) : null;
    }

    return {
      id,
      path: path.reverse(),
      distance: finalDistances.get(id),
    };
  });
}
