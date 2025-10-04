import { redirect } from '@sveltejs/kit'
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals, cookies }) => {
    // 1. Vider le store côté serveur
    locals.pb.authStore.clear();
    locals.user = null;
    cookies.delete('pb_auth', {
      path: '/',
      sameSite: 'none',
      secure: true,
      // domain: supprimé
    });

    // 3. Redirection
    throw redirect(303, `/${PUBLIC_BASE_URL ?? ''}`);
  },
}
