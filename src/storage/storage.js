import {
  calcualateExpirationTime,
  validateExpirationTime,
} from "../ttl/expirationTime.js";

const storage = new Map();

export function setValue(key, value, time) {
  let expirationTime = null;
  if (time) {
    expirationTime = calcualateExpirationTime(time);
  }
  storage.set(key, { value, expirationTime });

  return "OK";
}

export function getValue(key) {
  const value = storage.get(key);
  if (!value) {
    return "Key not found";
  }
  if (value.expirationTime && !validateExpirationTime(value.expirationTime)) {
    storage.delete(key);
    return "Key expired";
  }
  return value.value;
}

export function deleteValue(key) {
  storage.delete(key);
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
