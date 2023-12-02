// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-students", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  if (!admin && !['god', 'assistant'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  // eslint-disable-next-line
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  students.forEach((student) => {
    $app.dao().runInTransaction((txDao) => {
      // eslint-disable-next-line
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.user(student.get('user'), { txDao });
    });
  });

  return c.json(200, { "deletion-status": 'OK' });
}, $apis.activityLogger($app));
