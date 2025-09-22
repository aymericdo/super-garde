module.exports = {
  user: (userId, options) => {
    const { txApp } = options;

    try {
      const user = txApp.findRecordById("users", userId)
      txApp.delete(user)
      return true;
    } catch (error) {
      console.error("db user deletion failed", error);
    }
  },
  onCallSlot: (onCallSlotId, options) => {
    const { txApp } = options;

    try {
      const onCallSlot = txApp.findRecordById("onCallSlots", onCallSlotId)
      txApp.delete(onCallSlot)
      return true;
    } catch (error) {
      console.error("db onCallSlot deletion failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { txApp } = options;

    try {
      const onCallSlotsToHide = txApp.findRecordById("onCallSlotsToHide", onCallSlotId)
      txApp.delete(onCallSlotsToHide)
      return true;
    } catch (error) {
      console.error("db onCallSlotsToHide deletion failed", error);
    }
  },
};
