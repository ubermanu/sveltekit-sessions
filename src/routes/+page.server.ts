import type { PageServerLoad } from './$types.js'

export const load: PageServerLoad = async ({ locals, depends }) => {
  const { session } = locals

  depends('flashMessage')

  // Consume the flash message
  const flashMessage = session.get('flashMessage')
  session.delete('flashMessage')

  return {
    flashMessage,
  }
}
