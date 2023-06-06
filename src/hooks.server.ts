import { handleSession } from '$lib/sessions.server.js'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = handleSession
