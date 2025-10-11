import type { RecordModel } from 'pocketbase';
import type { LayoutServerLoad } from './$types'

const PER_PAGE = 25;
const START_PAGE = 1;

export const load: LayoutServerLoad = async ({ locals }) => {
  try {
    const studentList = await locals.pb.collection('students').getList(START_PAGE, PER_PAGE, { expand: 'user' });
    const studentIds = studentList.items.map((item: RecordModel) => item.id)
    const countByStudent = await locals.pb.send("/api/get-slot-count-student", {
      params: {
        studentIds: studentIds.join(','),
      }
    });

    return {
      countByStudent,
      studentList,
      page: START_PAGE,
      perPage: PER_PAGE,
      error: null,
    }
  } catch (e) {
    return {
      countByStudent: {},
      studentList: {
        items: [],
        totalItems: 0,
        page: 1,
        totalPages: 0,
        perPage: PER_PAGE,
      },
      page: START_PAGE,
      perPage: PER_PAGE,
      error: 'Impossible de charger les étudiants',
    };
  }
}
