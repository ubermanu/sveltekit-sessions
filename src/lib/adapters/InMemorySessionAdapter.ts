import type { SessionAdapter } from '$lib/SessionAdapter.js'

/** In-memory session adapter. Stores session data in memory using a Map. */
export class InMemorySessionAdapter implements SessionAdapter {
  private sessions = new Map<string, string>()

  read(sessionId: string): string | null {
    return this.sessions.get(sessionId) ?? null
  }

  write(sessionId: string, data: string): void {
    this.sessions.set(sessionId, data)
  }

  destroy(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  getExpiredSessions(timestamp: number): string[] {
    const expiredSessions: string[] = []
    this.sessions.forEach((_, sessionId) => {
      if (this.isSessionExpired(sessionId, timestamp)) {
        expiredSessions.push(sessionId)
      }
    })
    return expiredSessions
  }

  private isSessionExpired(sessionId: string, timestamp: number): boolean {
    const sessionData = this.sessions.get(sessionId)
    if (sessionData) {
      const session = JSON.parse(sessionData)
      return session.expires < timestamp
    }
    return false
  }
}
