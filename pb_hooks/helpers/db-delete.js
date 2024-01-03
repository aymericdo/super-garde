module.exports = {
  user: (userId, options) => {
    const { txDao } = options;

    try {
      const user = txDao.findRecordById("users", userId)
      txDao.deleteRecord(user)
      return true;
    } catch (error) {
      console.error("db user deletion failed", error);
    }
  },
  onCallSlot: (onCallSlotId, options) => {
    const { txDao } = options;

    try {
      const onCallSlot = txDao.findRecordById("onCallSlots", onCallSlotId)
      txDao.deleteRecord(onCallSlot)
      return true;
    } catch (error) {
      console.error("db onCallSlot deletion failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { txDao } = options;

    try {
      const onCallSlotsToHide = txDao.findRecordById("onCallSlotsToHide", onCallSlotId)
      txDao.deleteRecord(onCallSlotsToHide)
      return true;
    } catch (error) {
      console.error("db onCallSlotsToHide deletion failed", error);
    }
  },
};
