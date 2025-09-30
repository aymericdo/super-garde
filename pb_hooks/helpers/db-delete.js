module.exports = {
  user: (userId, options) => {
    const { $app } = options;

    try {
      const user = $app.findRecordById("users", userId)
      $app.delete(user)
      return true;
    } catch (error) {
      console.error("db user deletion failed", error);
    }
  },
  onCallSlot: (onCallSlotId, options) => {
    const { $app } = options;

    try {
      const onCallSlot = $app.findRecordById("onCallSlots", onCallSlotId)
      $app.delete(onCallSlot)
      return true;
    } catch (error) {
      console.error("db onCallSlot deletion failed", error);
    }
  },
  onCallSlotToHide: (onCallSlotId, options) => {
    const { $app } = options;

    try {
      const onCallSlotsToHide = $app.findRecordById("xxxonCallSlotsToHide", onCallSlotId)
      $app.delete(onCallSlotsToHide)
      return true;
    } catch (error) {
      console.error("db onCallSlotsToHide deletion failed", error);
    }
  },
};
