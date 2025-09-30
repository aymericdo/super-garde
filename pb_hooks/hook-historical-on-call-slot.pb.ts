/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const oldValue = e.record.original();
  const newValue = e.record;

  const dbCreate = require(`${__hooks}/helpers/db-create.js`);
  dbCreate.onCallSlotHistorical(e.record.id, { old: oldValue, new: newValue }, { $app });

  e.next()
}, "onCallSlots");
