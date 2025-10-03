module.exports = {
  user: (data, options) => {
    const { $app } = options;

    const {
      email,
      name,
    } = data;

    try {
      const usersCollection = $app.findCollectionByNameOrId("users");

      const userRecord = new Record(usersCollection, {
        "name": name,
        "email": email,
        "role": 'student',
      });

      // TODO: Change this password
      userRecord.setPassword("azerty1234");
      userRecord.setEmailVisibility(true);

      $app.save(userRecord)

      return userRecord;
    } catch (error) {
      console.error("db user creation failed", error);
    }
  },
  student: (data, userRecord, options) => {
    const { $app } = options;

    const {
      firstName,
      lastName,
      year,
      UHCD,
      onCallCount2025,
      totalOnCallCount
    } = data;

    try {
      const studentsCollection = $app.findCollectionByNameOrId("students");

      const studentRecord = new Record(studentsCollection, {
        "firstName": firstName,
        "lastName": lastName,
        "user": userRecord.id,
        "year": year,
        "UHCD": UHCD,
        "onCallCount2025": onCallCount2025,
        "totalOnCallCount": totalOnCallCount,
      });

      $app.save(studentRecord)

      return studentRecord;
    } catch (error) {
      console.error("db student creation failed", error);
    }
  },
  onCallSlot: (event, studentId, options) => {
    const { $app } = options;

    try {
      const onCallSlotsCollection = $app.findCollectionByNameOrId("onCallSlots");

      const onCallSlotRecord = new Record(onCallSlotsCollection, {
        "start": event.start,
        "end": event.end,
        "student": studentId,
        "hospital": event.hospital,
        "sector": event.sector,
      });

      $app.save(onCallSlotRecord)
      return onCallSlotRecord;
    } catch (error) {
      console.error("db onCallSlot creation failed", error);
    }
  },
  onCallSlotHistorical: (onCallSlotId, changes, options) => {
    const { $app } = options;

    try {
      const onCallSlotsHistoricalCollection = $app.findCollectionByNameOrId("onCallSlotsHistorical");

      const onCallSlotHistoricalRecord = new Record(onCallSlotsHistoricalCollection, {
        "onCallSlotId": onCallSlotId,
        "changes": changes,
      });

      $app.save(onCallSlotHistoricalRecord)
      return onCallSlotHistoricalRecord;
    } catch (error) {
      console.log("db onCallSlotHistorical creation failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { $app } = options;

    try {
      const onCallSlotsToHideCollection = $app.findCollectionByNameOrId("xxxonCallSlotsToHide");

      const onCallSlotsToHideRecord = new Record(onCallSlotsToHideCollection, {
        "onCallSlotId": onCallSlotId,
      });

      $app.save(onCallSlotsToHideRecord)
      return onCallSlotsToHideRecord;
    } catch (error) {
      console.log("db onCallSlotsToHide creation failed", error);
    }
  }
};
