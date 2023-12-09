// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/import-students", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  if (!admin && !['god', 'assistant'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  // eslint-disable-next-line
  const studentsGoogleSheet = require(`${__hooks}/helpers/students-google-sheet.js`);
  const list = studentsGoogleSheet.fetch(c, $http);
  console.log(`${list.length} students in the list`);

  list.forEach((line) => {
    $app.dao().runInTransaction((txDao) => {
      // eslint-disable-next-line
      const dbCreate = require(`${__hooks}/helpers/db-create.js`);
      const userRecord = dbCreate.user(line, { txDao, $app, $security });
      dbCreate.student(line, userRecord, { txDao });
    });
  });

  return c.json(200, { "importation-status": 'OK' });
}, $apis.activityLogger($app));
