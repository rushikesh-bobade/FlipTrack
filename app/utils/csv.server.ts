export function sanitizeCsvField(value: string | null | undefined): string {
  let sanitized = String(value ?? "");
  // Escape embedded double quotes
  sanitized = sanitized.replace(/"/g, '""');
  // Neutralize spreadsheet formula injection
  if (/^[=+\-@\t\r\n]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }
  return sanitized;
}
