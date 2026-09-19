import { timeUnits } from "../enums.js";

export function calcualateExpirationTime(time) {
  const unit = time[time.length - 1].trim().toUpperCase();
  const value = time.slice(0, -1).trim();
  const now = Date.now();
  const expirationTime = now + value * timeUnits[unit];
  return expirationTime ?? null;
}

export function validateExpirationTime(time) {
  const currentTime = Date.now();

  if (currentTime > time) {
    return false;
  }

  return true;
}
