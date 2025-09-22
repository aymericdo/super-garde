
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/delete-all-students", (e) => {
  const authRecord = e.auth

  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }
  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  students.forEach((student) => {
    $app.runInTransaction((txApp) => {
      
      const dbDelete = require(`${__hooks}/helpers/db-delete.js`);
      dbDelete.user(student.get('user'), { txApp });
    });
  });

  return e.json(200, { "deletion-status": 'OK' });
});
