import { clientCommands, timeUnits } from "../enums.js";

export function parseData(data) {
  const [Method, key, value, time] = data.toString().trim().split("::");

  if (!clientCommands.includes(Method.trim().toUpperCase())) {
    throw new Error(`Invalid method: ${Method}`);
  }

  if (
    time &&
    time[time.length - 1] &&
    !Object.keys(timeUnits).includes(time[time.length - 1].trim().toUpperCase())
  ) {
    throw new Error(
      `Invalid time unit: ${time[time.length - 1].trim().toUpperCase()}`,
    );
  }

  return {
    method: Method.trim().toUpperCase(),
    args: [key?.trim(), value?.trim()],
    time: time ? time.trim() : null,
  };
}
