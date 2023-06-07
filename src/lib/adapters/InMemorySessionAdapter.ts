import type { SessionAdapter } from '$lib/SessionAdapter.js'

/** In-memory session adapter. Stores session data in memory using a Map. */
export class InMemorySessionAdapter implements SessionAdapter {
  private sessions = new Map<string, string>()

  async read(sessionId: string) {
    return this.sessions.get(sessionId) ?? null
  }

  async write(sessionId: string, data: string) {
    this.sessions.set(sessionId, data)
  }

  async destroy(sessionId: string) {
    this.sessions.delete(sessionId)
  }

  async getExpiredSessions(timestamp: number) {
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
