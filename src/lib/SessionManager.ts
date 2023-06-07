import { Session } from '$lib/Session.js'
import type { SessionAdapter } from '$lib/SessionAdapter.js'
import { InMemorySessionAdapter } from '$lib/adapters/InMemorySessionAdapter.js'
import type { RequestEvent } from '@sveltejs/kit'
import { decrypt, encrypt, uuid } from './crypto.js'

type CookieParams = {
  path?: string
  domain?: string
  secure?: boolean
  httponly?: boolean
  maxAge?: number
}

/**
 * Sets up a session manager for the application.
 *
 * Currently, this is a very basic implementation that supports different
 * session adapters, including in-memory and file-based sessions. It is not
 * suitable for production use.
 */
export class SessionManager {
  private adapter: SessionAdapter
  private cookieName: string
  private secret: string
  private duration: number
  private cookieParams: CookieParams
  private gc_last: number
  private gc_probability: number

  constructor() {
    this.adapter = new InMemorySessionAdapter()
    this.cookieName = 'KITSESSID'
    this.secret = ''
    this.duration = 60 * 60 * 24 * 7
    this.cookieParams = {}
    this.gc_last = 0
    this.gc_probability = 1.0
  }

  createId() {
    return uuid()
  }

  /** Encode the session data, using the secret key */
  encode(data: Record<string, unknown>): string {
    return encrypt(JSON.stringify(data), this.secret)
  }

  /** Decode the session data, using the secret key */
  decode(data: string): Record<string, unknown> {
    return JSON.parse(decrypt(data, this.secret))
  }

  /** Get the session id from the request */
  id(event: RequestEvent): string | null {
    return event.cookies.get(this.cookieName) ?? null
  }

  /** Cancel all the changes made during the request */
  abort(event: RequestEvent) {
    // event.locals.session = null;
  }

  /** Start the session */
  async start(event: RequestEvent) {
    if (!event.cookies.get(this.cookieName)) {
      event.cookies.set(this.cookieName, this.createId(), this.cookieParams)
    }

    const sessionId = await this.id(event)
    event.locals.session = new Session(this, event)

    if (sessionId) {
      const sessionData = await this.adapter.read(sessionId)
      if (sessionData) {
        event.locals.session.data = this.decode(sessionData)
      }
    }
  }

  /** Destroy the session */
  async destroy(event: RequestEvent) {
    const sessionId = await this.id(event)
    if (sessionId) {
      await this.adapter.destroy(sessionId)
      event.cookies.delete(this.cookieName)
    }
    // delete event.locals.session;
  }

  /** Perform session data garbage collection */
  async gc() {
    const now = Date.now()
    if (now - this.gc_last < 1000 * 60 * 60) {
      return
    }

    this.gc_last = now

    if (Math.random() < this.gc_probability) {
      const expiredSessions = await this.adapter.getExpiredSessions(now)
      for (const sessionId of expiredSessions) {
        await this.adapter.destroy(sessionId)
      }
    }
  }

  /**
   * RegenerateId() will replace the current session id with a new one, and keep
   * the current session information.
   */
  async regenerateId(event: RequestEvent, deleteOldSession = false) {
    const oldId = await this.id(event)
    if (!oldId) {
      return false
    }

    const sessionData = await this.adapter.read(oldId)
    if (!sessionData) {
      return false
    }

    const newId = this.createId()
    await this.adapter.write(newId, sessionData, Date.now() + this.duration)
    event.cookies.set(this.cookieName, newId, this.cookieParams)

    if (deleteOldSession) {
      await this.adapter.destroy(oldId)
    }

    return true
  }

  async reset(event: RequestEvent) {
    await this.start(event)
    return true
  }

  /** Throws an exception if the session manager is not ready to handle sessions. */
  assertReady() {
    if (!this.secret) {
      throw new Error(
        'SessionManager secret is not set, please set it with setSecret()'
      )
    }
  }

  /** Set the session secret */
  setSecret(secret: string) {
    this.secret = secret
  }

  /** Set the session cookie name */
  setCookieName(name: string) {
    this.cookieName = name
  }

  /** Get the session cookie name */
  getCookieName() {
    return this.cookieName
  }

  /** Set additional cookie parameters */
  setCookieParams(params: CookieParams) {
    this.cookieParams = params
  }

  /** Get additional cookie parameters */
  getCookieParams(): CookieParams {
    return this.cookieParams
  }

  /** Set the session adapter */
  setAdapter(adapter: SessionAdapter) {
    this.adapter = adapter
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
  async writeClose(event: RequestEvent) {
    const sessionId = await this.id(event)
    const session = event.locals.session

    if (!sessionId || !session) {
      return false
    }

    const encodedData = this.encode(session.data)
    await this.adapter.write(sessionId, encodedData, Date.now() + this.duration)
    return true
  }

  /** Alias of session_write_close() */
  async commit(event: RequestEvent) {
    return this.writeClose(event)
  }
}
