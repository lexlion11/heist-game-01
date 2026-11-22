// COLD SIGNAL — the alarm meter. It fills while you are seen and bleeds off
// while you are not, and a full meter means the run is over.
export const ALARM_MAX = 100;
export const SEEN_FILL = 26;     // per second while seen
export const HEAR_FILL = 8;      // per second while only heard
export const COOLDOWN_DRAIN = 11; // per second while unseen
export const DETECTION_LIMIT = 100;

/** True when anybody is currently looking at the thief. */
export function anyoneSeesThief(state) {
  for (const guard of state.guards) if (guard.seen) return true;
  for (const camera of state.cameras) if (camera.seen) return true;
  return false;
}

/** True when the thief is close enough to a guard for it to hear them. */
export function anyoneHearsThief(state) {
  for (const guard of state.guards) if (guard.hears) return true;
  return false;
}

/** Update the alarm meter for one frame; returns true when the run is lost. */
export function updateAlarm(state, dt) {
  const alarm = state.alarm;
  const seen = anyoneSeesThief(state);
  const heard = !seen && anyoneHearsThief(state);

  if (seen) {
    alarm.level = Math.min(ALARM_MAX, alarm.level + SEEN_FILL * dt);
    alarm.lastSeenX = state.thief.x;
    alarm.lastSeenY = state.thief.y;
    alarm.seen = 1;
  } else {
    alarm.seen = Math.max(0, alarm.seen - dt * 3);
    if (heard) alarm.level = Math.min(ALARM_MAX, alarm.level + HEAR_FILL * dt);
    else alarm.level = Math.max(0, alarm.level - COOLDOWN_DRAIN * dt);
  }

  if (alarm.level > alarm.peak) alarm.peak = alarm.level;
  if (alarm.level >= DETECTION_LIMIT) {
    alarm.lockdown = true;
    return true;
  }
  return false;
}

/** How red the world should look, 0 (calm) to 1 (about to be caught). */
export function alarmUrgency(state) {
  return Math.min(1, state.alarm.level / DETECTION_LIMIT);
}

/** A short word for the alarm state, for the HUD. */
export function alarmLabel(state) {
  const level = state.alarm.level;
  if (level < 12) return 'DARK';
  if (level < 40) return 'SUSPICIOUS';
  if (level < 70) return 'ALERTED';
  if (level < 95) return 'HUNTED';
  return 'LOCKDOWN';
}
