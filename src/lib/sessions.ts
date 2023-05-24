import type { RequestEvent } from '@sveltejs/kit'
import fs from 'node:fs'
import { decrypt, encrypt, uuid } from './crypto.js'

export type SessionConfig = {
  cookieName?: string
  secret: string
  duration?: number
  activeDuration?: number
  savePath?: string
}

export interface Session<T> {
  id: string
  data: T
  lastActive: number
  regenerateId: () => void
  destroy: () => void
  unset: () => void
  abort: () => void
}

// TODO: Implement a garbage collector for those files
export const sessions = (event: RequestEvent, config: SessionConfig) => {
  const {
    cookieName = 'KITSESSID',
    secret,
    duration = 86400,
    activeDuration = 300,
    savePath = '/tmp',
  } = { ...config }

  const cookieParams = {
    maxAge: duration,
    path: '/',
    httpOnly: true,
  }

  const session: Partial<Session<unknown>> = {
    data: {},
    lastActive: Date.now(),
    regenerateId: session_regenerate_id,
    destroy: session_destroy,
    unset: session_unset,
    abort: session_abort,
  }

  /** Starts a new session or resumes an existing session. */
  function session_start(): void {
    const id = session_id()
    if (id) {
      const sessionFile = `${savePath}/${id}`
      const sessionData = fs.readFileSync(sessionFile, 'utf8')
      const decryptedSessionData = decrypt(sessionData, secret)
      try {
        const data = JSON.parse(decryptedSessionData)
        event.locals.session = { ...session, id, data }
      } catch (e) {
        event.locals.session = { ...session, id }
      }
    } else {
      const newId = uuid()
      event.cookies.set(cookieName, newId, cookieParams)
      event.locals.session = { ...session, id: newId }
    }
  }

  /** Retrieves the session ID. */
  function session_id(): string | undefined {
    return event.cookies.get(cookieName)
  }

  /** Regenerates the session ID. */
  function session_regenerate_id(): void {
    const id = session_id()
    if (id) {
      const newId = uuid()
      event.cookies.set(cookieName, newId, cookieParams)

      // Rename the session file
      const oldSessionFile = `${savePath}/${id}`
      const newSessionFile = `${savePath}/${newId}`
      fs.renameSync(oldSessionFile, newSessionFile)
    }
  }

  /** Destroys the session and deletes session data. */
  function session_destroy(): void {
    const id = session_id()
    if (id) {
      // destroy session
      const sessionFile = `${savePath}/${id}`
      fs.unlinkSync(sessionFile)
      event.cookies.delete(cookieName)
    }
    event.locals.session = { ...session, id }
  }

  /** Unsets all session variables. */
  function session_unset(): void {
    event.locals.session = { ...event.locals?.session, data: {} }
  }

  /** Writes session data and ends session. */
  function session_write_close(): void {
    const id = session_id()
    if (id) {
      // TODO: Save session data + lastActive + ttl
      const sessionFile = `${savePath}/${id}`
      const sessionData = JSON.stringify(event.locals.session?.data)
      const encryptedSessionData = encrypt(sessionData, secret)
      fs.writeFileSync(sessionFile, encryptedSessionData, 'utf8')
    }
    event.locals.session = { ...session, id }
  }

  /** Discards session array changes and finish session. */
  function session_abort(): void {
    event.locals.session = {}
  }

  return {
    start: session_start,
    id: session_id,
    regenerateId: session_regenerate_id,
    destroy: session_destroy,
    unset: session_unset,
    writeClose: session_write_close,
    abort: session_abort,
  }
}
