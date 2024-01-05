module.exports = {
  students: (options) => {
    const { $app } = options;

    let offset = 0;
    const perPage = 100;

    let lastStudentsArray = [];
    let students = [];

    try {
      do {
        lastStudentsArray = $app.dao().findRecordsByFilter("students", "id != ''", '-created', perPage, offset);
        students = students.concat(lastStudentsArray);
        offset += perPage;
      } while(lastStudentsArray.length)

      return students;
    } catch (error) {
      console.error("db students reading failed", error);
    }
  },
  onCallSlots: (options) => {
    const { $app } = options;

    let offset = 0;
    const perPage = 100;

    let lastOnCallSlotsArray = [];
    let onCallSlots = [];

    try {
      do {
        lastOnCallSlotsArray = $app.dao().findRecordsByFilter("onCallSlots", "id != ''", '-created', perPage, offset);
        onCallSlots = onCallSlots.concat(lastOnCallSlotsArray);
        offset += perPage;
      } while(lastOnCallSlotsArray.length)

      return onCallSlots;
    } catch (error) {
      console.error("db onCallSlots reading failed", error);
    }
  },
};
