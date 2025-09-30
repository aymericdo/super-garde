
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-on-call-slots", (e) => {
  const authRecord = e.auth

  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const onCallSlots = dbRead.onCallSlots({ $app });

  onCallSlots.forEach((onCallSlot) => {
    const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
    dbDelete.onCallSlot(onCallSlot.get('id'), { $app });
  });

  return e.json(200, { "deletion-status": 'OK' });
});
