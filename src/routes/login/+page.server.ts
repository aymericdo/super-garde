import { redirect } from '@sveltejs/kit'
import { base } from '$app/paths';
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const data = Object.fromEntries(await request.formData()) as {
      email: string
      password: string
      isAdmin: string
    }

    try {
      if (data.isAdmin === 'on') {
        await locals.pb
          .admins
          .authWithPassword(data.email, data.password);
      } else {
        await locals.pb
          .collection('users')
          .authWithPassword(data.email, data.password)
      }
    } catch (e) {
      console.error(e)
      throw e
    }

    throw redirect(303, base)
  },
}
