/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (e.record && authRecord && isSuperuser) {
    e.record.set(
      'updatedBy',
      `admin ${authRecord.id}`,
    );
  } else if (e.record && authRecord) {
    e.record.set(
      'updatedBy',
      `${authRecord.collection().name} ${authRecord.id}`,
    );
  }

  e.next()
}, "onCallSlots");

onModelAfterUpdateSuccess((e) => {
  const oldValue = e.model.originalCopy();
  const newValue = e.model;

  $app.dao().runInTransaction((txDao) => {
    const dbCreate = require(`${__hooks}/helpers/db-create.js`);
    dbCreate.onCallSlotHistorical(e.model.id, { old: oldValue, new: newValue }, { txDao });
  });

  const oldIsOnMarketValue = oldValue.get("isOnMarket");
  const newIsOnMarketValue = newValue.get("isOnMarket");

  if (oldIsOnMarketValue && !newIsOnMarketValue) {
    let toDelete = null;
    $app.dao().runInTransaction((txDao) => {
      const dbCreate = require(`${__hooks}/helpers/db-create.js`);
      toDelete = dbCreate.onCallSlotToHide(e.model.id, { txDao });
    });

    if (toDelete?.id) {
      $app.dao().runInTransaction((txDao) => {
        const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
        dbDelete.onCallSlotToHide(toDelete?.id, { txDao });
      });
    }
  }

  e.next()
}, "onCallSlots");
