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

  /** Starts a new session or resumes an existing session. */
  function session_start(): void {
    const id = session_id()
    if (id) {
      const sessionFile = `${savePath}/${id}`
      const sessionData = fs.readFileSync(sessionFile, 'utf8')
      const decryptedSessionData = decrypt(sessionData, secret)
      try {
        event.locals.session = JSON.parse(decryptedSessionData)
      } catch (e) {
        event.locals.session = {}
      }
    } else {
      event.cookies.set(cookieName, uuid(), cookieParams)
      event.locals.session = {}
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
    event.locals.session = {}
  }

  /** Unsets all session variables. */
  function session_unset(): void {
    event.locals.session = {}
  }

  /** Writes session data and ends session. */
  function session_write_close(): void {
    const id = session_id()
    if (id) {
      const sessionFile = `${savePath}/${id}`
      const sessionData = JSON.stringify(event.locals.session)
      const encryptedSessionData = encrypt(sessionData, secret)
      fs.writeFileSync(sessionFile, encryptedSessionData, 'utf8')
    }
    event.locals.session = {}
  }

  /** Discards session array changes and finish session. */
  function session_abort(): void {
    event.locals.session = {}
  }

  return {
    session_start,
    session_id,
    session_regenerate_id,
    session_destroy,
    session_unset,
    session_write_close,
    session_abort,
  }
}
