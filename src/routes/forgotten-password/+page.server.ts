import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const data = Object.fromEntries(await request.formData()) as {
      email: string
    }

    try {
      await locals.pb
        .collection('users')
        .requestPasswordReset(data.email)
    } catch (e) {
      return fail(403, { message: 'Réinitialisation impossible' })
    }

    return { success: true }
  },
}
