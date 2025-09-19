
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-on-call-slots", (e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (!isSuperuser && !['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const onCallSlots = dbRead.onCallSlots({ $app });

  onCallSlots.forEach((onCallSlot) => {
    $app.dao().runInTransaction((txDao) => {
      
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.onCallSlot(onCallSlot.get('id'), { txDao });
    });
  });

  return e.json(200, { "deletion-status": 'OK' });
});
