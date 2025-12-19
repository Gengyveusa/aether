export function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export function getEnv(name: string, defaultValue?: string): string | undefined {
  return process.env[name] ?? defaultValue;
}
