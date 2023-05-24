import type { Actions } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  login: async ({ locals }) => {
    locals.session.loggedIn = true
    throw redirect(303, '/')
  },
  logout: async ({ locals }) => {
    locals.session.loggedIn = false
    throw redirect(303, '/')
  },
}
