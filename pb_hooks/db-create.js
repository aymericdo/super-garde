module.exports = {
  user: (line, options) => {
    const { txDao, $app, $security } = options;

    try {
      const usersCollection = txDao.findCollectionByNameOrId("users");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/utils.js`);
      const {
        email,
        name,
        username,
      } = utils.csvParser(line, 'student')

      const userRecord = new Record(usersCollection);

      const form = new RecordUpsertForm($app, userRecord);

      form.loadData({
        "name": name,
        "email": email,
        "username": `${username}_${$security.randomStringWithAlphabet(2, "123456789")}`,
        "role": 'student',
      });

      form.setPassword("azerty1234");
      form.setEmailVisibility(true);

      form.submit();

      return userRecord;
    } catch (error) {
      console.log("db user creation failed", error);
    }
  },
  student: (line, userRecord, options) => {
    const { txDao, $app } = options;

    try {
      const studentsCollection = txDao.findCollectionByNameOrId("students");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/utils.js`);
      const {
        firstName,
        lastName,
      } = utils.csvParser(line, 'student')

      const studentRecord = new Record(studentsCollection);

      const form = new RecordUpsertForm($app, studentRecord);

      form.loadData({
        "firstName": firstName,
        "lastName": lastName,
        "user": userRecord.id,
      });

      form.submit();
      return studentRecord;
    } catch (error) {
      console.log("db student creation failed", error);
    }
  },
  onCallSlot: (event, student, options) => {
    const { txDao, $app } = options;

    try {
      const onCallSlotsCollection = txDao.findCollectionByNameOrId("onCallSlots");

      const onCallSlotRecord = new Record(onCallSlotsCollection);

      const form = new RecordUpsertForm($app, onCallSlotRecord);

      form.loadData({
        "start": event.start,
        "end": event.end,
        "student": student.id,
        "hospital": event.hospital,
        "sector": event.sector,
      });

      form.submit();

      return onCallSlotRecord;
    } catch (error) {
      console.log("db onCallSlot creation failed", error);
    }
  }
};
