module.exports = {
  student: (data, userRecord, options) => {
    const { $app } = options;

    const {
      year,
      UHCD,
      onCallCount2025,
      totalOnCallCount,
    } = data;

    try {
      const studentRecord = $app.findFirstRecordByFilter('students', "user = {:user}", { user: userRecord.id });

      studentRecord.set("year", year);
      studentRecord.set("UHCD", UHCD);
      if (onCallCount2025) studentRecord.set("onCallCount2025", onCallCount2025);
      if (totalOnCallCount) studentRecord.set("totalOnCallCount", totalOnCallCount);

      $app.save(studentRecord);

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
};
