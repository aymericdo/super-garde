// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/import-all-students", (e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (!isSuperuser && !['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const googleSheetUrl = e.request?.url?.query().get("url")

  // eslint-disable-next-line
  const studentsGoogleSheet = require(`${__hooks}/helpers/students-google-sheet.js`);
  const list = studentsGoogleSheet.fetch(googleSheetUrl, { e, $http });
  console.log(`${list.length} students in the list`);

  list.forEach((line) => {
    // eslint-disable-next-line
    const utils = require(`${__hooks}/helpers/utils.js`);
    const {
      firstName,
      lastName,
      email,
      name,
      username,
      year,
    } = utils.csvParser(line, 'student')

    let userSameEmail;
    try {
      userSameEmail = $app.dao().findFirstRecordByFilter('users', "email = {:email}", { email });
    } catch (error) {
      console.error(error);
    }

    $app.dao().runInTransaction((txDao) => {
      if (userSameEmail) {
        // eslint-disable-next-line
        const dbUpdate = require(`${__hooks}/helpers/db-update.js`);
        dbUpdate.student({ year }, userSameEmail, { txDao });
      } else {
        // eslint-disable-next-line
        const dbCreate = require(`${__hooks}/helpers/db-create.js`);
        const userRecord = dbCreate.user({ email, name, username }, { txDao, $app, $security });
        dbCreate.student({ firstName, lastName, year }, userRecord, { txDao });
      }
    });
  });

  return e.json(200, { "importation-status": 'OK' });
});
