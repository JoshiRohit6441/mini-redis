import {
  addMemory,
  calculateEntrySize,
  canStore,
  removeMemory,
} from "../LRU/memoryCalculation.js";
import {
  calcualateExpirationTime,
  validateExpirationTime,
} from "../ttl/expirationTime.js";

export const storage = new Map();

function evictKey(key) {
  const entry = storage.get(key);

  if (!entry) {
    return false;
  }

  const entrySize = calculateEntrySize(
    key,
    entry.value,
    entry.expirationTime,
  );

  storage.delete(key);
  removeMemory(entrySize);

  return true;
}

function removeLRU() {
  const lruKey = storage.keys().next().value;

  if (lruKey === undefined) {
    return false;
  }

  return evictKey(lruKey);
}

export function setValue(key, value, time) {
  let expirationTime = null;

  if (time) {
    expirationTime = calcualateExpirationTime(time);
  }

  const newEntrySize = calculateEntrySize(key, value, expirationTime);

  if (storage.has(key)) {
    evictKey(key);
  }

  while (!canStore(newEntrySize)) {
    if (!removeLRU()) {
      return "Memory limit exceeded";
    }
  }

  storage.set(key, {
    value,
    expirationTime,
  });

  addMemory(newEntrySize);

  return "OK";
}

export function getValue(key) {
  const entry = storage.get(key);

  if (!entry) {
    return "Key not found";
  }

  if (entry.expirationTime && !validateExpirationTime(entry.expirationTime)) {
    evictKey(key);
    return "Key expired";
  }

  storage.delete(key);
  storage.set(key, entry);

  return entry.value;
}

export function deleteValue(key) {
  if (!storage.has(key)) {
    return "Key deleted";
  }

  evictKey(key);
  return "Key deleted";
}

export default function handleClientRequest(method, args, time) {
  switch (method) {
    case "SET":
      return setValue(args[0], args[1], time);
    case "GET":
      return getValue(args[0]);
    case "DEL":
      return deleteValue(args[0]);
    case "PING":
      return "PONG";
    default:
      return "Invalid method";
  }
}
