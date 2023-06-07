import type { SessionAdapter } from '$lib/SessionAdapter.js'

/** In-memory session adapter. Stores session data in memory using a Map. */
export class InMemorySessionAdapter implements SessionAdapter {
  private sessions: Map<string, { data: string; expires: number }>

  constructor() {
    this.sessions = new Map()
  }

  async read(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId)
    if (session && session.expires < Date.now()) {
      this.sessions.delete(sessionId)
      return null
    }
    return session ? session.data : null
  }

  async write(sessionId: string, data: string, expires: number): Promise<void> {
    this.sessions.set(sessionId, { data, expires })
  }

  async destroy(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  async getExpiredSessions(timestamp: number): Promise<string[]> {
    const expiredSessions: string[] = []
    this.sessions.forEach((session, sessionId) => {
      if (session.expires < timestamp) {
        expiredSessions.push(sessionId)
      }
    })
    return expiredSessions
  }
}
