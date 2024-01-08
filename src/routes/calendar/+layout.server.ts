import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  let currentStudent;
  try {
    try {
      if (locals.user && !locals.user.isAdmin) {
        currentStudent = await locals.pb.collection('students').getFirstListItem(`user = "${locals.user.id}"`);
      }
    } catch (_) {
      currentStudent = undefined;
    }

    return {
      currentStudent,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
