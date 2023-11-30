module.exports = {
  user: (userId, options) => {
    const { txDao } = options;

    try {
      const user = txDao.findRecordById("users", userId)
      txDao.deleteRecord(user)
      return true;
    } catch (error) {
      console.log("db user deletion failed", error);
    }
  },
  onCallSlot: (onCallSlotId, options) => {
    const { txDao } = options;

    try {
      const onCallSlot = txDao.findRecordById("onCallSlots", onCallSlotId)
      txDao.deleteRecord(onCallSlot)
      return true;
    } catch (error) {
      console.log("db onCallSlot deletion failed", error);
    }
  },
};
