const d = [[1, 0], [0, -1], [-1, 0], [0, 1]];
const DIR = {
  DOWN: 0,
  LEFT: 1,
  UP: 2,
  RIGHT: 3,
};
// 2^4 mappings from mask to new direction after a possible turn
// assuming the wall is on the right in the current direction
const turnDirection = [
  -1,
  DIR.DOWN,
  DIR.RIGHT,
  DIR.RIGHT,
  DIR.UP,
  -1,
  DIR.UP,
  DIR.UP,
  DIR.LEFT,
  DIR.DOWN,
  -1,
  DIR.RIGHT,
  DIR.LEFT,
  DIR.DOWN,
  DIR.LEFT,
  -1,
];

function vectorize(start, used, matrix) {
  const n = used.length;
  const m = used[0].length;

  // mark everything with a bfs
  const q = [];
  q.push(start);

  let area = 0;
  for (let front = 0; front < q.length; front++) {
    const cur = q[front];
    area++;
    for (let di = 0; di < d.length; di++) {
      const next = [cur[0] + d[di][0], cur[1] + d[di][1]];

      if (
        next[0] >= 0 &&
        next[0] < n &&
        next[1] >= 0 &&
        next[1] < m &&
        !used[next[0]][next[1]] &&
        matrix[next[0]][next[1]] === matrix[start[0]][start[1]]
      ) {
        used[next[0]][next[1]] = true;
        q.push(next);
      }
    }
  }

  // skip anything too small
  if (area < n * m * 0.01) {
    return null;
  }

  // assume that start is indeed the left-most element of the top-most row
  // belonging to the figure we are trying to vectorize
  const points = [start];
  let direction = DIR.RIGHT; // start moving right
  let cur = start;

  function getMask(pos) {
    const [y, x] = pos;
    const [sy, sx] = start;
    let mask = 0;
    if (x > 0 && y > 0 && matrix[y - 1][x - 1] === matrix[sy][sx]) mask |= 1;
    mask <<= 1;

    if (y > 0 && x < m && matrix[y - 1][x] === matrix[sy][sx]) mask |= 1;
    mask <<= 1;

    if (y < n && x < m && matrix[y][x] === matrix[sy][sx]) mask |= 1;
    mask <<= 1;

    if (y < n && x > 0 && matrix[y][x - 1] === matrix[sy][sx]) mask |= 1;

    return mask;
  }

  while (true) {
    const next = [cur[0] + d[direction][0], cur[1] + d[direction][1]];

    points.push(next);
    if (next[0] === start[0] && next[1] === start[1]) break;

    const mask = getMask(next);
    let nDirection = turnDirection[mask];

    if (nDirection === -1) {
      nDirection = (direction + 1) % 4;
    }

    direction = nDirection;
    cur = next;
  }

  return points;
}

export function computeVectorized(matrix) {
  const n = matrix.length;
  const m = matrix[0].length;

  const used = matrix.map(row => row.map(() => false));
  const vectors = [];

  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++)
      if (!used[i][j] && matrix[i][j] !== 0)
        vectors.push(vectorize([i, j], used, matrix));

  return vectors.filter(v => !!v);
}
