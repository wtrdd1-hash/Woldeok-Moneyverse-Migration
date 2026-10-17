export function isBroadcastConfigured(value) {
  return typeof value === 'string' && value.length >= 32;
}
