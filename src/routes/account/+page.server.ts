import type { Actions } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  /**
   * Login the user
   *
   * @param locals
   */
  login: async ({ locals }) => {
    console.log('login')
    locals.session.set('loggedIn', true)
    throw redirect(303, '/')
  },
  /**
   * Logout the user
   *
   * @param locals
   */
  logout: async ({ locals }) => {
    console.log('logout')
    locals.session.delete('loggedIn')
    throw redirect(303, '/')
  },
}
