module.exports = {
  student: (data, userRecord, options) => {
    const { $app } = options;

    const {
      year,
      UHCD,
    } = data;

    try {
      const studentRecord = $app.findFirstRecordByFilter('students', "user = {:user}", { user: userRecord.id });

      studentRecord.set("year", year);
      studentRecord.set("UHCD", UHCD);

      $app.save(studentRecord);

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
};
