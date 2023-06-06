import type { Handle, RequestEvent } from '@sveltejs/kit'
import { decrypt, encrypt, uuid } from './crypto.js'

/** Sets up a PHP-like session system, but for SvelteKit. */

// TODO: Config
let secret: string = 'my-secret'

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

const sessions = new Map<string, Session>()

/** Create new session id */
export const session_create_id = () => uuid()

/** Discard session array changes and finish session */
export const session_abort = (event: RequestEvent) => {
  event.locals.session = null
}

/** Decodes session data from a session encoded string */
export const session_decode = (data: string) => {
  return JSON.parse(decrypt(data, secret))
}

/** Destroys all data registered to a session */
export const session_destroy = (event: RequestEvent) => {
  const sessionId = session_id(event)
  if (sessionId) {
    sessions.delete(sessionId)
    event.cookies.delete(session_name())
  }
  delete event.locals.session
}

/** Encodes the current session data as a session encoded string */
export const session_encode = (data: string) => {
  return encrypt(JSON.stringify(data), secret)
}

export const session_get_cookie_params = () => {}

let last_gc = 0
let gc_probability = 1.0

/**
 * Perform session data garbage collection
 *
 * Session_gc() is used to perform session data GC(garbage collection). PHP does
 * probability based session GC by default.
 *
 * Probability based GC works somewhat but it has few problems. 1) Low traffic
 * sites' session data may not be deleted within the preferred duration. 2) High
 * traffic sites' GC may be too frequent GC. 3) GC is performed on the user's
 * request and the user will experience a GC delay.
 *
 * Therefore, it is recommended to execute GC periodically for production
 * systems using, e.g., "cron" for UNIX-like systems. Make sure to disable
 * probability based GC by setting session.gc_probability to 0.
 */
export const session_gc = () => {
  const now = Date.now()
  if (now - last_gc < 1000 * 60 * 60) {
    return
  }

  last_gc = now

  if (Math.random() < gc_probability) {
    const now = Date.now()
    sessions.forEach((session, id) => {
      if (session.expires < now) {
        sessions.delete(id)
      }
    })
  }
}

/** Get the current session id */
export const session_id = (event: RequestEvent): string | null => {
  return event.cookies.get(session_name()) ?? null
}

/** Get the current session name */
// TODO: Config
export const session_name = (): string => 'KITSESSID'

/**
 * Session_regenerate_id() will replace the current session id with a new one,
 * and keep the current session information.
 *
 * When session.use_trans_sid is enabled, output must be started after
 * session_regenerate_id() call. Otherwise, old session ID is used.
 */
export const session_regenerate_id = (
  event: RequestEvent,
  delete_old_session = false
): boolean => {
  const oldId = session_id(event)

  if (!oldId) {
    return false
  }

  const session = sessions.get(oldId)

  if (!session) {
    return false
  }

  const newId = session_create_id()
  sessions.set(newId, session)

  event.cookies.set(session_name(), newId)

  if (delete_old_session) {
    sessions.delete(oldId)
  }

  return true
}

// TODO: Implement
export const session_register_shutdown = () => {}

/** Re-initialize session array with original values */
export const session_reset = (event: RequestEvent) => {
  session_start(event)
  return true
}

// TODO: Implement
export const session_set_cookie_params = () => {}

// TODO: Implement
export const session_set_save_handler = () => {}

/** Start new or resume existing session */
export const session_start = (event: RequestEvent) => {
  if (!event.cookies.get(session_name())) {
    event.cookies.set(session_name(), session_create_id())
  }

  const sessionId = session_id(event)
  const session = sessionId ? sessions.get(sessionId) : null
  event.locals.session = {}

  if (session?.data) {
    event.locals.session = session_decode(session.data)
  }
}

const KIT_SESSION_DISABLED = 0
const KIT_SESSION_NONE = 1
const KIT_SESSION_ACTIVE = 2

/** Returns the current session status */
export const session_status = (event: RequestEvent) => {
  if (event.locals.session) {
    return KIT_SESSION_ACTIVE
  } else {
    return KIT_SESSION_NONE
  }
}

/**
 * The session_unset() function frees all session variables currently
 * registered.
 */
export const session_unset = (event: RequestEvent) => {
  event.locals.session = {}
  return true
}

/**
 * Write session data and end session
 *
 * End the current session and store session data.
 *
 * Session data is usually stored after your script terminated without the need
 * to call session_write_close(), but as session data is locked to prevent
 * concurrent writes only one script may operate on a session at any time. When
 * using framesets together with sessions you will experience the frames loading
 * one by one due to this locking. You can reduce the time needed to load all
 * the frames by ending the session as soon as all changes to session variables
 * are done.
 */
export const session_write_close = (event: RequestEvent) => {
  const sessionId = session_id(event)
  if (sessionId) {
    sessions.set(sessionId, {
      data: session_encode(event.locals.session),
      expires: Date.now() + 180 * 60,
    })
  }
  return true
}

/** Alias of session_write_close() */
export const session_commit = (event: RequestEvent) => {
  return session_write_close(event)
}

/** Custom session handler for Kit */
export const handleSession: Handle = async ({ event, resolve }) => {
  session_start(event)
  const response = await resolve(event)
  session_write_close(event)
  return response
}
