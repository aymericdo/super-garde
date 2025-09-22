module.exports = {
  student: (data, userRecord, options) => {
    const { txApp } = options;

    const {
      year,
    } = data;

    try {
      const studentRecord = txApp.findFirstRecordByFilter('students', "user = {:user}", { user: userRecord.id });

      studentRecord.set("year", year);

      txApp.save(studentRecord);

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
};
