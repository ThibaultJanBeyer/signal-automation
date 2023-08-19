export function ensureEnvIsDefined(
  value: string | undefined,
  envVariableName: string,
): string {
  if (typeof value !== "string" || value.length === 0)
    throw `Missing ENV: ${envVariableName}`;
  return value;
}
