import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ locals }) => {
  locals.session.set('flashMessage', {
    type: 'danger',
    message: 'You are not authorized to view this page',
  })

  throw redirect(302, '/')
}
