import { PRIVATE_SESSION_SECRET } from '$env/static/private'
import { handleSession, sessionManager } from '$lib/index.js'
import type { Handle } from '@sveltejs/kit'

// Set the session secret
sessionManager.setSecret(PRIVATE_SESSION_SECRET)

export const handle: Handle = handleSession
