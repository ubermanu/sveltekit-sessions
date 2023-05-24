import { sessions } from '$lib/index.js'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const sessionManager = sessions(event, {
    secret: 'my-secret',
  })
  sessionManager.session_start()

  const response = await resolve(event)
  sessionManager.session_write_close()

  return response
}
