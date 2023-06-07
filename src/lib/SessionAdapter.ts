/**
 * Interface for session adapters. Session adapters are responsible for managing
 * session data storage.
 */
export interface SessionAdapter {
  read(sessionId: string): Promise<string | null>
  write(sessionId: string, data: string, expires: number): Promise<void>
  destroy(sessionId: string): Promise<void>
  getExpiredSessions(timestamp: number): Promise<string[]>
}
