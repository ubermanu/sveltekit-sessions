import type { Actions } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  /** Login the user */
  login: async ({ locals }) => {
    locals.session.set('flashMessage', {
      type: 'success',
      message: 'You are now logged in',
    })

    throw redirect(303, '/')
  },

  /** Logout the user */
  logout: async ({ locals }) => {
    locals.session.set('flashMessage', {
      type: 'success',
      message: 'You are now logged out',
    })

    throw redirect(303, '/')
  },
}
