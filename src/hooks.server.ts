import { handleSession } from '$lib/index.js'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = handleSession
