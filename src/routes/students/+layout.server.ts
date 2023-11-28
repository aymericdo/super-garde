import type { LayoutServerLoad } from './$types'

const PER_PAGE = 25;
const START_PAGE = 0;

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    const studentList = await locals.pb.collection('students').getList(START_PAGE, PER_PAGE, { expand: 'user' });

    return {
      studentList,
      page: START_PAGE,
      perPage: PER_PAGE,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}
