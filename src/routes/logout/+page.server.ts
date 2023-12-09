import { redirect } from '@sveltejs/kit'
import { base } from '$app/paths';
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals }) => {
    locals.pb.authStore.clear()
    locals.user = null
    console.log(base);
    console.log('bite');
    throw redirect(303, base)
  },
}
