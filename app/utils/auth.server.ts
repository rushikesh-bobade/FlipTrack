export function isSessionValid(expiresAt: number): boolean {
  return Date.now() < expiresAt;
}

export function formatSessionCookie(sessionId: string): string {
  return `session_id=${sessionId}; HttpOnly; Secure; Path=/`;
}
