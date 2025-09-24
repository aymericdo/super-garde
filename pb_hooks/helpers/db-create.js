module.exports = {
  user: (data, options) => {
    const { txApp } = options;

    const {
      email,
      name,
    } = data;

    try {
      const usersCollection = txApp.findCollectionByNameOrId("users");

      const userRecord = new Record(usersCollection, {
        "name": name,
        "email": email,
        "role": 'student',
      });

      userRecord.setPassword("azerty1234");
      userRecord.setEmailVisibility(true);

      txApp.save(userRecord)

      return userRecord;
    } catch (error) {
      console.error("db user creation failed", error);
    }
  },
  student: (data, userRecord, options) => {
    const { txApp } = options;

    const {
      firstName,
      lastName,
      year,
      UHCD,
    } = data;

    try {
      const studentsCollection = txApp.findCollectionByNameOrId("students");

      const studentRecord = new Record(studentsCollection, {
        "firstName": firstName,
        "lastName": lastName,
        "user": userRecord.id,
        "year": year,
        "UHCD": UHCD,
      });

      txApp.save(studentRecord)

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
  onCallSlot: (event, studentId, options) => {
    const { txApp } = options;

    try {
      const onCallSlotsCollection = txApp.findCollectionByNameOrId("onCallSlots");

      const onCallSlotRecord = new Record(onCallSlotsCollection, {
        "start": event.start,
        "end": event.end,
        "student": studentId,
        "hospital": event.hospital,
        "sector": event.sector,
      });

      txApp.save(onCallSlotRecord)
      return onCallSlotRecord;
    } catch (error) {
      console.error("db onCallSlot creation failed", error);
    }
  },
  onCallSlotHistorical: (onCallSlotId, changes, options) => {
    const { txApp } = options;

    try {
      const onCallSlotsHistoricalCollection = txApp.findCollectionByNameOrId("onCallSlotsHistorical");

      const onCallSlotHistoricalRecord = new Record(onCallSlotsHistoricalCollection, {
        "onCallSlotId": onCallSlotId,
        "changes": changes,
      });

      txApp.save(onCallSlotHistoricalRecord)
      return onCallSlotHistoricalRecord;
    } catch (error) {
      console.log("db onCallSlotHistorical creation failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { txApp } = options;

    try {
      const onCallSlotsToHideCollection = txApp.findCollectionByNameOrId("onCallSlotsToHide");

      const onCallSlotsToHideRecord = new Record(onCallSlotsToHideCollection, {
        "onCallSlotId": onCallSlotId,
      });

      txApp.save(onCallSlotsToHideRecord)
      return onCallSlotsToHideRecord;
    } catch (error) {
      console.log("db onCallSlotsToHide creation failed", error);
    }
  }
};
