// COLD SIGNAL — wall cameras and their cones. They can be cut from the panel.
import { distance, segmentBlocked, angleDelta } from './level.js';

export const CAMERA_RANGE = 235;
export const CAMERA_HALF_ANGLE = 0.48;

/** Build the camera array for a new run. */
export function makeCameras() {
  return [
    { id: 'cam-atrium', name: 'CAM A1', x: 625, y: 96, angle: Math.PI * 0.72, sweep: 0.42, phase: 0.0, range: CAMERA_RANGE, fov: CAMERA_HALF_ANGLE, alive: true, online: true },
    { id: 'cam-vault', name: 'CAM V1', x: 1190, y: 250, angle: Math.PI, sweep: 0.34, phase: 1.4, range: CAMERA_RANGE, fov: CAMERA_HALF_ANGLE, alive: true, online: true },
    { id: 'cam-dock', name: 'CAM D1', x: 78, y: 620, angle: -Math.PI * 0.28, sweep: 0.4, phase: 2.1, range: CAMERA_RANGE, fov: CAMERA_HALF_ANGLE, alive: true, online: true },
    { id: 'cam-cold', name: 'CAM C1', x: 1190, y: 470, angle: Math.PI * 1.28, sweep: 0.36, phase: 0.7, range: CAMERA_RANGE, fov: CAMERA_HALF_ANGLE, alive: true, online: true },
  ];
}

/** Swing each live camera's cone back and forth. */
export function updateCamera(camera, time) {
  camera.angle = camera.baseAngle ?? (camera.baseAngle = camera.angle);
  camera.angle = camera.baseAngle + Math.sin(time * 0.8 + camera.phase) * camera.sweep;
}

/** True when a live camera can see the thief. */
export function cameraSeesThief(camera, state) {
  if (!camera.online) return false;
  const thief = state.thief;
  if (thief.hidden) return false;
  const d = distance(camera.x, camera.y, thief.x, thief.y);
  if (d > camera.range) return false;
  const toThief = Math.atan2(thief.y - camera.y, thief.x - camera.x);
  if (Math.abs(angleDelta(toThief, camera.angle)) > camera.fov) return false;
  if (segmentBlocked(camera.x, camera.y, thief.x, thief.y)) return false;
  return true;
}

/** Take a camera offline for good. */
export function disableCamera(camera) {
  camera.online = false;
}
