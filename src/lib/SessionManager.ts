import { Session } from '$lib/Session.js'
import type { RequestEvent } from '@sveltejs/kit'
import { decrypt, encrypt, uuid } from './crypto.js'

/**
 * Sets up a session manager for the application.
 *
 * Currently, this is a very basic implementation that only supports
 * cookie-based and in-memory sessions. It is not suitable for production use.
 */
export class SessionManager {
  private sessions = new Map<string, { data: string; expires: number }>()

  private cookieName: string
  private secret: string
  private duration: number

  private gc_last: number
  private gc_probability: number

  constructor() {
    this.cookieName = 'KITSESSID'
    this.secret = ''
    this.duration = 60 * 60 * 24 * 7

    this.gc_last = 0
    this.gc_probability = 1.0
  }

  createId() {
    return uuid()
  }

  encode(data: Record<string, unknown>) {
    return encrypt(JSON.stringify(data), this.secret)
  }

  decode(data: string) {
    return JSON.parse(decrypt(data, this.secret))
  }

  id(event: RequestEvent) {
    return event.cookies.get(this.cookieName) ?? null
  }

  abort(event: RequestEvent) {
    // TODO: event.locals.session = null
  }

  /** Start the session */
  start(event: RequestEvent) {
    if (!event.cookies.get(this.cookieName)) {
      event.cookies.set(this.cookieName, this.createId())
    }

    const sessionId = this.id(event)
    const session = sessionId ? this.sessions.get(sessionId) : null
    event.locals.session = new Session(this, event)

    if (session) {
      event.locals.session.data = this.decode(session.data)
    }
  }

  /** Destroy the session */
  destroy(event: RequestEvent) {
    const sessionId = this.id(event)
    if (sessionId) {
      this.sessions.delete(sessionId)
      event.cookies.delete(this.cookieName)
    }
    // TODO: delete event.locals.session
  }

  /** Perform session data garbage collection */
  gc() {
    const now = Date.now()
    if (now - this.gc_last < 1000 * 60 * 60) {
      return
    }

    this.gc_last = now

    if (Math.random() < this.gc_probability) {
      const now = Date.now()
      this.sessions.forEach((session, id) => {
        if (session.expires < now) {
          this.sessions.delete(id)
        }
      })
    }
  }

  /**
   * RegenerateId() will replace the current session id with a new one, and keep
   * the current session information.
   */
  regenerateId(event: RequestEvent, deleteOldSession = false) {
    const oldId = this.id(event)
    if (!oldId) {
      return false
    }

    const session = this.sessions.get(oldId)
    if (!session) {
      return false
    }

    const newId = this.createId()
    this.sessions.set(newId, session)
    event.cookies.set(this.cookieName, newId)

    if (deleteOldSession) {
      this.sessions.delete(oldId)
    }

    return true
  }

  /** Re-initialize session array with original values */
  reset(event: RequestEvent) {
    this.start(event)
    return true
  }

  setCookieParams() {
    // TODO: Implement
  }

  setSaveHandler() {
    // TODO: Implement
  }

  status(event: RequestEvent): boolean {
    return !!this.id(event)
  }

  /** The unset() function frees all session variables currently registered. */
  unset(event: RequestEvent) {
    event.locals.session.data = {}
    return true
  }

  /** End the current session and store session data. */
  writeClose(event: RequestEvent) {
    const sessionId = this.id(event)
    const session = event.locals.session

    if (!sessionId || !session) {
      return false
    }

    this.sessions.set(sessionId, {
      data: this.encode(event.locals.session.data),
      expires: Date.now() + this.duration,
    })
    return true
  }

  /** Alias of session_write_close() */
  commit(event: RequestEvent) {
    return this.writeClose(event)
  }
}
