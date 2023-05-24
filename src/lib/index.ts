import type { Handle } from '@sveltejs/kit'
import { sessions, type SessionConfig } from './sessions.js'

/** Returns a SvelteKit handle function that manages a session file. */
export const handleSession =
  (config: SessionConfig): Handle =>
  async ({ event, resolve }) => {
    const sessionManager = sessions(event, config)
    sessionManager.session_start()

    const response = await resolve(event)
    sessionManager.session_write_close()

    return response
  }

export * from './sessions.js'
