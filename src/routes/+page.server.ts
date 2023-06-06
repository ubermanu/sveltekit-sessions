import type { PageServerLoad } from './$types.js'

export const load: PageServerLoad = async ({ locals }) => {
  console.log('locals', locals)

  // WARN: This is unsafe, but it's just an example
  return {
    session: locals.session,
  }
}
