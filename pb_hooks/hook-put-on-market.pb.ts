/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const oldValue = e.record.original();
  const newValue = e.record;

  const oldIsOnMarketValue = oldValue.get("isOnMarket");
  const newIsOnMarketValue = newValue.get("isOnMarket");

  if (oldIsOnMarketValue && !newIsOnMarketValue) {
    let toDelete = null;
    const dbCreate = require(`${__hooks}/helpers/db-create.js`);
    toDelete = dbCreate.onCallSlotToHide(e.record.id, { $app });

    if (toDelete?.id) {
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.onCallSlotToHide(toDelete?.id, { $app });
    }
  }

  e.next()
}, "onCallSlots");
