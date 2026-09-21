import config from "../config.js";

let totalMemoryUsage = 0;

export function calculateEntrySize(key, value, expirationTime) {
  let size = 0;

  size += Buffer.byteLength(String(key), "utf8");
  size += Buffer.byteLength(String(value), "utf8");

  if (expirationTime) {
    size += 8;
  }

  return size;
}

export function canStore(entrySize) {
  return totalMemoryUsage + entrySize <= config.max_memory;
}

export function addMemory(entrySize) {
  totalMemoryUsage += entrySize;
}

export function removeMemory(entrySize) {
  totalMemoryUsage = Math.max(0, totalMemoryUsage - entrySize);
}

export function getMemoryUsage() {
  return totalMemoryUsage;
}
