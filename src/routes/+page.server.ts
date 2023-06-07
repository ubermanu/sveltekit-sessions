import type { PageServerLoad } from './$types.js'

export const load: PageServerLoad = async ({ locals }) => {
  const { session } = locals

  // Consume the flash message
  const flashMessage = session.get('flashMessage')
  session.delete('flashMessage')

  return {
    flashMessage,
  }
}
