
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-students", (e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (!isSuperuser && !['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  students.forEach((student) => {
    $app.dao().runInTransaction((txDao) => {
      
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.user(student.get('user'), { txDao });
    });
  });

  return e.json(200, { "deletion-status": 'OK' });
});
