import { computePath } from '../image-processing/LiveWire';
import { LineUtil } from 'leaflet';

export function computeTrace(
  points,
  { height, width, imageData },
  { smoothing, precision }
) {
  points = points.slice();
  points.push(points[0]);
  const path = computePath({
    points: points.map(({ lng, lat }) => ({
      x: lng,
      y: lat,
    })),
    height,
    width,
    imageData,
    markRadius: precision,
  });
  const simplePath = LineUtil.simplify(path, smoothing || 0.6);
  return simplePath.map(({ x, y }) => ({ lng: x, lat: y }));
}
