import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  let currentStudent = null;
  try {
    const onCallSlotList = await locals.pb.collection('onCallSlots').getFullList({ expand: 'student' })

    try {
      if (locals.user && !locals.user.isAdmin) {
        currentStudent = await locals.pb.collection('students').getFirstListItem(`user = "${locals.user.id}"`);
      }
    } catch (_) {
      currentStudent = null;
    }

    return {
      onCallSlotList,
      currentStudent,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
