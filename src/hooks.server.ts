import { handleSession } from '$lib/session.server.js'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = handleSession
