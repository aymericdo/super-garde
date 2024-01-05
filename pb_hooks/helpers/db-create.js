module.exports = {
  user: (data, options) => {
    const { txDao, $security } = options;

    const {
      email,
      name,
      username,
    } = data;

    try {
      const usersCollection = txDao.findCollectionByNameOrId("users");

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
  student: (data, userRecord, options) => {
    const { txDao } = options;

    const {
      firstName,
      lastName,
      year,
    } = data;

    try {
      const studentsCollection = txDao.findCollectionByNameOrId("students");

      const studentRecord = new Record(studentsCollection, {
        "firstName": firstName,
        "lastName": lastName,
        "user": userRecord.id,
        "year": year,
      });

      txDao.saveRecord(studentRecord)

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
  onCallSlot: (event, studentId, options) => {
    const { txDao } = options;

    try {
      const onCallSlotsCollection = txDao.findCollectionByNameOrId("onCallSlots");

      const onCallSlotRecord = new Record(onCallSlotsCollection, {
        "start": event.start,
        "end": event.end,
        "student": studentId,
        "hospital": event.hospital,
        "sector": event.sector,
      });

      txDao.saveRecord(onCallSlotRecord)
      return onCallSlotRecord;
    } catch (error) {
      console.error("db onCallSlot creation failed", error);
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
