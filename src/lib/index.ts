import type { Session } from '$lib/Session.js'
import { SessionManager } from '$lib/SessionManager.js'
import type { Handle } from '@sveltejs/kit'

/** The session manager instance */
export const sessionManager = new SessionManager()

/** Custom session handler for Kit */
export const handleSession: Handle = async ({ event, resolve }) => {
  sessionManager.assertReady()
  sessionManager.start(event)
  const response = await resolve(event)
  sessionManager.commit(event)
  return response
}

/** Augment the default App.Locals interface to include our session */
declare global {
  namespace App {
    interface Locals {
      session: Session
    }
  }
}

export type { SessionAdapter } from '$lib/SessionAdapter.js'
export { FileSessionAdapter } from '$lib/adapters/FileSessionAdapter.js'
export { InMemorySessionAdapter } from '$lib/adapters/InMemorySessionAdapter.js'
export { Session }
