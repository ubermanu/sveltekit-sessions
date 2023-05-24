import type { Handle } from '@sveltejs/kit'
import { sessions, type SessionConfig } from './sessions.js'

/** Returns a SvelteKit handle function that manages a session file. */
export const handleSession =
  (config: SessionConfig): Handle =>
  async ({ event, resolve }) => {
    const sessionManager = sessions(event, config)
    sessionManager.start()

    const response = await resolve(event)
    sessionManager.writeClose()

    return response
  }

export * from './sessions.js'
