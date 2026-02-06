export function escapeFilePath(path: string): string {
  if (path === "") {
    return "''";
  }
  return `'${path.replace(/'/g, "'\\''")}'`;
}
