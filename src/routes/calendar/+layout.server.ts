import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    const onCallSlotList = await locals.pb.collection('onCallSlots').getFullList({ expand: 'student' })

    return {
      onCallSlotList,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
