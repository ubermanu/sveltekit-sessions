import type { Actions } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  /** Login the user */
  login: async ({ locals }) => {
    const { session } = locals

    session.set('flash_message', {
      type: 'success',
      message: 'You are now logged in',
    })

    session.set('user_id', crypto.randomUUID())

    throw redirect(303, '/')
  },

  /** Logout the user */
  logout: async ({ locals }) => {
    const { session } = locals

    session.set('flash_message', {
      type: 'success',
      message: 'You are now logged out',
    })

    session.delete('user_id')

    throw redirect(303, '/')
  },
}
