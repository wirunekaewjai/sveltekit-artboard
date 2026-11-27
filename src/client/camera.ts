import type { PositionedBoard } from '#src/client/layout.ts';

export type CameraState = {
  camX: number;
  camY: number;
  zoom: number;
};

export type Point2D = {
  x: number;
  y: number;
};

export type PinchMetrics = {
  dist: number;
  midX: number;
  midY: number;
};

const MIN_ZOOM = 0.12;
const MAX_ZOOM = 2.0;

export const clampZoom = (nextZoom: number): number => {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
};

export const computePinchMetrics = (points: readonly Point2D[]): PinchMetrics | null => {
  if (points.length < 2) {
    return null;
  }
  const [p1, p2] = points;
  return {
    dist: Math.max(1, Math.hypot(p2.x - p1.x, p2.y - p1.y)),
    midX: (p1.x + p2.x) / 2,
    midY: (p1.y + p2.y) / 2,
  };
};

export const computePinchTransform = (
  start: PinchMetrics & CameraState,
  current: PinchMetrics,
): CameraState => {
  const nextZoom = clampZoom(start.zoom * (current.dist / start.dist));
  const ratio = nextZoom / start.zoom;
  return {
    zoom: nextZoom,
    camX: current.midX - (start.midX - start.camX) * ratio,
    camY: current.midY - (start.midY - start.camY) * ratio,
  };
};

export const computeZoomAtPoint = (
  camera: CameraState,
  point: Point2D,
  factor: number,
): CameraState => {
  const nextZoom = clampZoom(camera.zoom * factor);
  const ratio = nextZoom / camera.zoom;
  return {
    zoom: nextZoom,
    camX: point.x - (point.x - camera.camX) * ratio,
    camY: point.y - (point.y - camera.camY) * ratio,
  };
};

export const computeFocusBoard = (
  board: PositionedBoard,
  viewportWidth: number,
  viewportHeight: number,
): CameraState => {
  const pad = 120;
  const targetZoom = Math.max(
    0.25,
    Math.min(
      1.0,
      Math.min((viewportWidth - pad) / board.width, (viewportHeight - pad) / board.height),
    ),
  );
  return {
    zoom: targetZoom,
    camX: viewportWidth / 2 - (board.x + board.width / 2) * targetZoom,
    camY: viewportHeight / 2 - (board.y + board.height / 2) * targetZoom,
  };
};

export const computeFitAll = (
  boards: readonly PositionedBoard[],
  viewportWidth: number,
  viewportHeight: number,
): CameraState | null => {
  if (boards.length === 0) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const b of boards) {
    if (b.x < minX) {
      minX = b.x;
    }
    if (b.y < minY) {
      minY = b.y;
    }
    if (b.x + b.width > maxX) {
      maxX = b.x + b.width;
    }
    if (b.y + b.height > maxY) {
      maxY = b.y + b.height;
    }
  }

  const contentW = maxX - minX + 200;
  const contentH = maxY - minY + 200;
  const nextZoom = Math.max(
    MIN_ZOOM,
    Math.min(0.8, Math.min(viewportWidth / contentW, viewportHeight / contentH)),
  );

  return {
    zoom: nextZoom,
    camX: (viewportWidth - contentW * nextZoom) / 2 - (minX - 100) * nextZoom,
    camY: (viewportHeight - contentH * nextZoom) / 2 - (minY - 100) * nextZoom,
  };
};
