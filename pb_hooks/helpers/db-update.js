module.exports = {
  student: (data, userRecord, options) => {
    const { txApp } = options;

    const {
      year,
      UHCD,
    } = data;

    try {
      const studentRecord = txApp.findFirstRecordByFilter('students', "user = {:user}", { user: userRecord.id });

      studentRecord.set("year", year);
      studentRecord.set("UHCD", UHCD);

      txApp.save(studentRecord);

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
};
