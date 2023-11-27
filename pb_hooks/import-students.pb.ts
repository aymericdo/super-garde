// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/import-students", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  if (!admin && !['god', 'admin'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  // eslint-disable-next-line
  const studentsGoogleSheet = require(`${__hooks}/students-google-sheet.js`);
  const list = studentsGoogleSheet.fetch(c, $http);
  console.log(list);

  // eslint-disable-next-line
  const dbCreate = require(`${__hooks}/db-create.js`);

  list.forEach((line) => {
    $app.dao().runInTransaction((txDao) => {
      const userRecord = dbCreate.user(line, { txDao, $security });
      dbCreate.student(line, userRecord, { txDao });
    });
  });

  return c.json(200, { "importation-status": 'OK' });
});