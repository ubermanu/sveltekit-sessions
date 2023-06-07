/**
 * Interface for session adapters. Session adapters are responsible for managing
 * session data storage.
 */
export interface SessionAdapter {
  /**
   * Read the session data from the storage.
   *
   * @param sessionId
   */
  read(sessionId: string): string | null

  /**
   * Write the session data to the storage.
   *
   * @param sessionId
   * @param data
   */
  write(sessionId: string, data: string): void

  /**
   * Destroy the session data in the storage.
   *
   * @param sessionId
   */
  destroy(sessionId: string): void

  /**
   * Get the expired sessions.
   *
   * @param timestamp
   */
  getExpiredSessions(timestamp: number): string[]
}
