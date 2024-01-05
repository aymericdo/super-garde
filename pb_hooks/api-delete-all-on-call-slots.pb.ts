// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-on-call-slots", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  if (!admin && !['god', 'assistant'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  // eslint-disable-next-line
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const onCallSlots = dbRead.onCallSlots({ $app });

  onCallSlots.forEach((onCallSlot) => {
    $app.dao().runInTransaction((txDao) => {
      // eslint-disable-next-line
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.onCallSlot(onCallSlot.get('id'), { txDao });
    });
  });

  return c.json(200, { "deletion-status": 'OK' });
}, $apis.activityLogger($app));
