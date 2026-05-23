const useColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

export function red(s: string): string {
  return useColor ? `[31m${s}[0m` : s;
}

export function green(s: string): string {
  return useColor ? `[32m${s}[0m` : s;
}

export function dim(s: string): string {
  return useColor ? `[2m${s}[0m` : s;
}
