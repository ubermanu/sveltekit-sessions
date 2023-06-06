import { SessionManager } from '$lib/SessionManager.js'
import type { Handle } from '@sveltejs/kit'

/** The session manager instance */
export const sessionManager = new SessionManager()

/** Custom session handler for Kit */
export const handleSession: Handle = async ({ event, resolve }) => {
  sessionManager.start(event)
  const response = await resolve(event)
  sessionManager.commit(event)
  return response
}

export type { Session } from '$lib/Session.js'
