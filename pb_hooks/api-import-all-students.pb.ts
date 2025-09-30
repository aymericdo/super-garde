
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/import-all-students", (e) => {
  const authRecord = e.auth

  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const googleSheetUrl = e.request?.url?.query().get("url")
  
  const studentsGoogleSheet = require(`${__hooks}/helpers/students-google-sheet.js`);
  const list = studentsGoogleSheet.fetch(googleSheetUrl, { e, $http });
  console.log(`${list.length} students in the list`);

  list.forEach((line) => {
    const utils = require(`${__hooks}/helpers/utils.js`);
    const {
      firstName,
      lastName,
      email,
      name,
      year,
      UHCD,
    } = utils.csvParser(line, 'student')

    let userSameEmail = null;
    try {
      userSameEmail = $app.findFirstRecordByFilter('users', "email = {:email}", { email });
    } catch (error) {
      console.error(error);
    }

    $app.runInTransaction((txApp) => {
      if (userSameEmail) {
        const dbUpdate = require(`${__hooks}/helpers/db-update.js`);
        dbUpdate.student({ year, UHCD }, userSameEmail, { $app: txApp });
      } else {
        const dbCreate = require(`${__hooks}/helpers/db-create.js`);
        const userRecord = dbCreate.user({ email, name }, { $app: txApp });
        dbCreate.student({ firstName, lastName, year, UHCD }, userRecord, { $app: txApp });
      }
    });
  });

  return e.json(200, { "importation-status": 'OK' });
});
