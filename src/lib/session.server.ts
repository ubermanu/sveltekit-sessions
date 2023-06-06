import type { Handle, RequestEvent } from '@sveltejs/kit'
import { decrypt, encrypt, uuid } from './crypto.js'

type Session = {
  data: string
  expires: number
}

type SessionManagerConfig = {
  cookieName?: string
  secret: string
  duration?: number
  activeDuration?: number
  savePath?: string
}

/**
 * Sets up a session manager for the application.
 *
 * Currently, this is a very basic implementation that only supports
 * cookie-based and in-memory sessions. It is not suitable for production use.
 */
class SessionManager {
  private sessions = new Map<string, Session>()

  private cookieName: string
  private secret: string
  private duration: number
  private activeDuration: number
  private savePath: string

  private gc_last: number
  private gc_probability: number

  constructor(config: SessionManagerConfig) {
    this.cookieName = config.cookieName ?? 'KITSESSID'
    this.secret = config.secret
    this.duration = config.duration ?? 60 * 60 * 24 * 7
    this.activeDuration = config.activeDuration ?? 60 * 60
    this.savePath = config.savePath ?? '/tmp'

    this.gc_last = 0
    this.gc_probability = 1.0
  }

  createId() {
    return uuid()
  }

  encode(data: string) {
    return encrypt(JSON.stringify(data), this.secret)
  }

  decode(data: string) {
    return JSON.parse(decrypt(data, this.secret))
  }

  name() {
    return this.cookieName
  }

  id(event: RequestEvent) {
    return event.cookies.get(this.cookieName) ?? null
  }

  abort(event: RequestEvent) {
    event.locals.session = null
  }

  start(event: RequestEvent) {
    if (!event.cookies.get(this.name())) {
      event.cookies.set(this.name(), this.createId())
    }

    const sessionId = this.id(event)
    const session = sessionId ? this.sessions.get(sessionId) : null
    event.locals.session = {}

    if (session?.data) {
      event.locals.session = this.decode(session.data)
    }
  }

  destroy(event: RequestEvent) {
    const sessionId = this.id(event)
    if (sessionId) {
      this.sessions.delete(sessionId)
      event.cookies.delete(this.name())
    }
    delete event.locals.session
  }

  /**
   * Perform session data garbage collection
   *
   * Session_gc() is used to perform session data GC(garbage collection). PHP
   * does probability based session GC by default.
   *
   * Probability based GC works somewhat but it has few problems. 1) Low traffic
   * sites' session data may not be deleted within the preferred duration. 2)
   * High traffic sites' GC may be too frequent GC. 3) GC is performed on the
   * user's request and the user will experience a GC delay.
   *
   * Therefore, it is recommended to execute GC periodically for production
   * systems using, e.g., "cron" for UNIX-like systems. Make sure to disable
   * probability based GC by setting session.gc_probability to 0.
   */
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
   * Session_regenerate_id() will replace the current session id with a new one,
   * and keep the current session information.
   *
   * When session.use_trans_sid is enabled, output must be started after
   * session_regenerate_id() call. Otherwise, old session ID is used.
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

    event.cookies.set(this.name(), newId)

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
    event.locals.session = {}
    return true
  }

  /**
   * End the current session and store session data.
   *
   * Session data is usually stored after your script terminated without the
   * need to call session_write_close(), but as session data is locked to
   * prevent concurrent writes only one script may operate on a session at any
   * time. When using framesets together with sessions you will experience the
   * frames loading one by one due to this locking. You can reduce the time
   * needed to load all the frames by ending the session as soon as all changes
   * to session variables are done.
   */
  writeClose(event: RequestEvent) {
    const sessionId = this.id(event)
    if (sessionId) {
      this.sessions.set(sessionId, {
        data: this.encode(event.locals.session),
        expires: Date.now() + this.duration,
      })
    }
    return true
  }

  /** Alias of session_write_close() */
  commit(event: RequestEvent) {
    return this.writeClose(event)
  }
}

export const session = new SessionManager({ secret: 'my-secret' })

/** Custom session handler for Kit */
export const handleSession: Handle = async ({ event, resolve }) => {
  session.start(event)
  const response = await resolve(event)
  session.writeClose(event)
  return response
}
