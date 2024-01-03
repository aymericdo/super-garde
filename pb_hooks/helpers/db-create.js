module.exports = {
  user: (line, options) => {
    const { txDao, $security } = options;

    try {
      const usersCollection = txDao.findCollectionByNameOrId("users");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/helpers/utils.js`);
      const {
        email,
        name,
        username,
      } = utils.csvParser(line, 'student')

      const userRecord = new Record(usersCollection, {
        "name": name,
        "email": email,
        "username": `${username}_${$security.randomStringWithAlphabet(2, "123456789")}`,
        "role": 'student',
      });

      userRecord.setPassword("azerty1234");
      userRecord.setEmailVisibility(true);

      txDao.saveRecord(userRecord)

      return userRecord;
    } catch (error) {
      console.error("db user creation failed", error);
    }
  },
  student: (line, userRecord, options) => {
    const { txDao } = options;

    try {
      const studentsCollection = txDao.findCollectionByNameOrId("students");

      // eslint-disable-next-line
      const utils = require(`${__hooks}/helpers/utils.js`);
      const {
        firstName,
        lastName,
      } = utils.csvParser(line, 'student')

      const studentRecord = new Record(studentsCollection, {
        "firstName": firstName,
        "lastName": lastName,
        "user": userRecord.id,
      });

      txDao.saveRecord(studentRecord)

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
  onCallSlot: (event, student, options) => {
    const { txDao } = options;

    try {
      const onCallSlotsCollection = txDao.findCollectionByNameOrId("onCallSlots");

      const onCallSlotRecord = new Record(onCallSlotsCollection, {
        "start": event.start,
        "end": event.end,
        "student": student.id,
        "hospital": event.hospital,
        "sector": event.sector,
      });

      txDao.saveRecord(onCallSlotRecord)
      return onCallSlotRecord;
    } catch (error) {
      console.log("db onCallSlot creation failed", error);
    }
  },
  onCallSlotHistorical: (onCallSlotId, changes, options) => {
    const { txDao } = options;

    try {
      const onCallSlotsHistoricalCollection = txDao.findCollectionByNameOrId("onCallSlotsHistorical");

      const onCallSlotHistoricalRecord = new Record(onCallSlotsHistoricalCollection, {
        "onCallSlotId": onCallSlotId,
        "changes": changes,
      });

      txDao.saveRecord(onCallSlotHistoricalRecord)
      return onCallSlotHistoricalRecord;
    } catch (error) {
      console.log("db onCallSlotHistorical creation failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { txDao } = options;

    try {
      const onCallSlotsToHideCollection = txDao.findCollectionByNameOrId("onCallSlotsToHide");

      const onCallSlotsToHideRecord = new Record(onCallSlotsToHideCollection, {
        "onCallSlotId": onCallSlotId,
      });

      txDao.saveRecord(onCallSlotsToHideRecord)
      return onCallSlotsToHideRecord;
    } catch (error) {
      console.log("db onCallSlotsToHide creation failed", error);
    }
  }
};
