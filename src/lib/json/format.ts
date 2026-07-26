export function formatJson(raw: string, spaces: number = 2): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed, null, spaces);
}

export function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
}
