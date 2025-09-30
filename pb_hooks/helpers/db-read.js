module.exports = {
  students: (options) => {
    const { $app } = options;

    try {
      const students = $app.findAllRecords("students")
      return students;
    } catch (error) {
      console.error("db students reading failed", error);
    }
  },
  onCallSlots: (options) => {
    const { $app } = options;

    try {
      const onCallSlots = $app.findAllRecords("onCallSlots")
      return onCallSlots;
    } catch (error) {
      console.error("db onCallSlots reading failed", error);
    }
  },
};
