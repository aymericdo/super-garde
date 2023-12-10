import { redirect } from '@sveltejs/kit'
import { BASE_URL } from '$env/static/private'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals }) => {
    locals.pb.authStore.clear()
    locals.user = null
    throw redirect(303, `/${BASE_URL ?? ''}`)
  },
}
