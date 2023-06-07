import type { PageServerLoad } from './$types.js'

export const load: PageServerLoad = async ({ locals, depends }) => {
  const { session } = locals

  depends('flashMessage')

  // Consume the flash message
  const flashMessage = session.get('flash_message')
  session.delete('flash_message')

  return {
    flashMessage,
    user: {
      id: session.get('user_id'),
    },
  }
}
