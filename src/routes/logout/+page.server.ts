import { redirect } from '@sveltejs/kit'
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals }) => {
    locals.pb.authStore.clear()
    locals.user = null
    throw redirect(303, `/${PUBLIC_BASE_URL ?? ''}`)
  },
}
