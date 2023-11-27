import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    const studentList = await locals.pb.collection('students').getFullList({ expand: 'user' })

    return {
      studentList,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
