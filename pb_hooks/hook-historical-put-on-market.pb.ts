/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
  const authRecord = e.auth

  if (e.record && authRecord) {
    e.record.set(
      'updatedBy',
      authRecord.id,
    );
  }

  e.next()
}, "onCallSlots");

onModelAfterUpdateSuccess((e) => {
  const oldValue = e.model.original();
  const newValue = e.model;

  $app.runInTransaction((txApp) => {
    const dbCreate = require(`${__hooks}/helpers/db-create.js`);
    dbCreate.onCallSlotHistorical(e.model.id, { old: oldValue, new: newValue }, { txApp });
  });

  const oldIsOnMarketValue = oldValue.get("isOnMarket");
  const newIsOnMarketValue = newValue.get("isOnMarket");

  if (oldIsOnMarketValue && !newIsOnMarketValue) {
    let toDelete = null;
    $app.runInTransaction((txApp) => {
      const dbCreate = require(`${__hooks}/helpers/db-create.js`);
      toDelete = dbCreate.onCallSlotToHide(e.model.id, { txApp });
    });

    if (toDelete?.id) {
      $app.runInTransaction((txApp) => {
        const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
        dbDelete.onCallSlotToHide(toDelete?.id, { txApp });
      });
    }
  }

  e.next()
}, "onCallSlots");
