// COLD SIGNAL — the vault, its cracking timer, the loot and the escape.
import { VAULT, distance } from './level.js';

export const PICK_TIME = 4.2;      // seconds of lock work with the bare hands
export const PICK_TIME_TOOL = 1.6; // seconds with the lockpick tool
export const CARRY_CAPACITY = 3;   // packets the thief can carry at once

/** Put the vault back to its locked state. */
export function resetVault(state) {
  state.vault.x = VAULT.x + VAULT.w / 2;
  state.vault.y = VAULT.y + VAULT.h / 2;
  state.vault.progress = 0;
  state.vault.cracked = 0;
  state.vault.packets = 0;
  state.vault.opening = false;
}

/** True when the thief stands at the vault. */
export function thiefAtVault(state) {
  return distance(state.thief.x, state.thief.y, state.vault.x, state.vault.y) < 62;
}

/** Work the lock: returns how much progress was made this frame (0..1). */
export function workVault(state, dt, hasTool) {
  const vault = state.vault;
  if (vault.cracked >= CARRY_CAPACITY) return 0;
  const need = hasTool ? PICK_TIME_TOOL : PICK_TIME;
  vault.progress += dt / need;
  vault.opening = true;
  if (vault.progress >= 1) {
    vault.progress = 0;
    vault.cracked += 1;
    vault.packets += 1;
    state.loot.packets += 1;
    state.loot.value += state.loot.packetValue;
    state.thief.carrying += 1;
  }
  return dt;
}

/** The value the thief is hauling right now. */
export function carriedValue(state) {
  return state.thief.carrying * state.loot.packetValue;
}

/** True when the vault holds nothing more. */
export function vaultEmpty(state) {
  return state.vault.cracked >= CARRY_CAPACITY;
}

/** True when the thief stands in the getaway van's zone. */
export function thiefAtExit(state) {
  const exit = state.exit.zone;
  return state.thief.x > exit.x && state.thief.x < exit.x + exit.w && state.thief.y > exit.y && state.thief.y < exit.y + exit.h;
}
