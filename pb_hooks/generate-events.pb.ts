// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/generate-events", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  const startDate = new Date(c.queryParam("startDate"))
  const endDate = new Date(c.queryParam("endDate"))
 
  if (!admin && !['god', 'admin'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const SECTORS = {
    rea: ['dfasm3'],
    urgence1: [],
    urgence2: [],
    urgence3: [],
    chirgurgie: [],
    etage: [],
  }

  const studentsByDate = {};
  const eventByDate = {};

  // eslint-disable-next-line
  const dbRead = require(`${__hooks}/db-read.js`);
  const students = dbRead.students({ $app });

  $app.dao().runInTransaction((txDao) => {
    let studentIndex = 0;
    const currentDate = startDate;

    while (currentDate < endDate) {
      Object.keys(SECTORS).forEach((sector) => {
        const currentStudent = students[studentIndex];

        if (Object.prototype.hasOwnProperty.call(studentsByDate, currentDate.toISOString())
          && studentsByDate[currentDate.toISOString()].some((id) => id === currentStudent?.get('id'))) {
          // defensive safeguard to avoid double booking
          return;
        }

        const startEventDate = new Date(currentDate);
        const endEventDate = new Date(currentDate);
        startEventDate.setHours(18);
        endEventDate.setHours(19);

        const event = {
          start: startEventDate,
          end: endEventDate,
          hospital: 'Trousseau',
          sector,
        }

        // eslint-disable-next-line
        const dbCreate = require(`${__hooks}/db-create.js`);
        dbCreate.onCallSlot(event, currentStudent, { $app, txDao });

        if (Object.prototype.hasOwnProperty.call(studentsByDate, currentDate.toISOString())) {
          studentsByDate[currentDate.toISOString()].push(currentStudent.get('id'));
          eventByDate[currentDate.toISOString()].push(event);
        } else {
          studentsByDate[currentDate.toISOString()] = [currentStudent.get('id')];
          eventByDate[currentDate.toISOString()] = [event];
        }

        studentIndex = (studentIndex + 1) % students.length;
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return c.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate });
}, $apis.activityLogger($app));
