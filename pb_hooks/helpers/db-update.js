module.exports = {
  student: (data, userRecord, options) => {
    const { txDao } = options;

    const {
      year,
    } = data;

    try {
      const studentRecord = txDao.findFirstRecordByFilter('students', "user = {:user}", { user: userRecord.id });

      studentRecord.set("year", year);

      txDao.saveRecord(studentRecord);

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
};
