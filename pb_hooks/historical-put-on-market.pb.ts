// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

onRecordBeforeUpdateRequest((e) => {
  const info = $apis.requestInfo(e.httpContext);
  const admin = info.admin;
  const record = info.authRecord;

  console.log(e.record && record);

  if (e.record && record) {
    e.record.set(
      'updatedBy',
      `${record.collection().name} ${record.id}`,
    );
  } else if (e.record && admin) {
    e.record.set(
      'updatedBy',
      `admin ${admin.id}`,
    );
  }
}, "onCallSlots");

onModelAfterUpdate((e) => {
  const oldValue = e.model.originalCopy();
  const newValue = e.model;

  $app.dao().runInTransaction((txDao) => {
    // eslint-disable-next-line
    const dbCreate = require(`${__hooks}/helpers/db-create.js`);
    dbCreate.onCallSlotHistorical(e.model.id, { old: oldValue, new: newValue }, { txDao });
  });

  const oldIsOnMarketValue = oldValue.get("isOnMarket");
  const newIsOnMarketValue = newValue.get('isOnMarket');

  if (oldIsOnMarketValue && !newIsOnMarketValue) {
    let toDelete = null;
    $app.dao().runInTransaction((txDao) => {
      // eslint-disable-next-line
      const dbCreate = require(`${__hooks}/helpers/db-create.js`);
      toDelete = dbCreate.onCallSlotToHide(e.model.id, { txDao });
    });

    if (toDelete?.id) {
      $app.dao().runInTransaction((txDao) => {
        // eslint-disable-next-line
        const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
        dbDelete.onCallSlotToHide(toDelete?.id, { txDao });
      });
    }
  }
}, "onCallSlots");
