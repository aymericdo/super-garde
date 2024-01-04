// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/generate-events", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  const startDate = new Date(c.queryParam("startDate"))
  const endDate = new Date(c.queryParam("endDate"))
 
  if (!admin && !['god', 'assistant'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const SECTORS_BY_HOSPITAL = {
    'Trousseau': [
      ['Chirurgie', 'MM1'],
      ['Psychiatrie', 'MM2'],
      ['Urgence secteur 1 - 2', 'MM2'],
      ['Urgence secteur 1 - 2', 'MM3'],
      ['Urgence secteur 3', 'MM1'],
      ['Urgence secteur 3', 'MM1'],
      ['Urgence secteur 3', 'MM3'],
      ['USCI Cardiologie', 'MM1'],
    ],
    'Bretonneau': [
      ['Étage', 'MM1'],
      ['Gynécologie', 'MM2'],
      ['Obstétrique', 'MM2'],
      ['Réanimation 1 - 2', 'MM2'],
      ['Réanimation 3 - 4', 'MM3'],
    ],
    'Clocheville': [
      ['Pédiatrie', 'MM2'],
      ['Pédiatrie', 'MM3'],
    ],
  };

  const studentsByDate = {};
  const eventByDate = {};
  const eventCountByStudent = {};

  // eslint-disable-next-line
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  $app.dao().runInTransaction((txDao) => {
    const currentDate = startDate;

    while (currentDate < endDate) {
      Object.keys(SECTORS_BY_HOSPITAL).forEach((hospital) => {
        SECTORS_BY_HOSPITAL[hospital].forEach(([sector, year]) => {
          // defensive safeguard to avoid double booking
          const alreadyBookedStudentIds = Object.prototype.hasOwnProperty.call(studentsByDate, currentDate.toISOString())
            ? studentsByDate[currentDate.toISOString()]
            : [];

          const validStudentIds = students.reduce((prev, student) => {
            if (student.get('year') === year && !alreadyBookedStudentIds.includes(student.get('id'))) {
              prev.push(student.get('id'));
            }

            return prev;
          }, []).sort((a, b) => {
            if (!Object.prototype.hasOwnProperty.call(eventCountByStudent, a)) {
              return -1;
            }

            if (!Object.prototype.hasOwnProperty.call(eventCountByStudent, b)) {
              return 1;
            }

            return eventCountByStudent[a] - eventCountByStudent[b];
          });

          if (!validStudentIds.length) return;

          const currentStudentId = validStudentIds[0];

          const startEventDate = new Date(currentDate);
          const endEventDate = new Date(currentDate);
          startEventDate.setHours(18);
          endEventDate.setHours(19);

          const event = {
            start: startEventDate,
            end: endEventDate,
            hospital,
            sector,
          }

          // eslint-disable-next-line
          const dbCreate = require(`${__hooks}/helpers/db-create.js`);
          dbCreate.onCallSlot(event, currentStudentId, { $app, txDao });

          if (Object.prototype.hasOwnProperty.call(studentsByDate, currentDate.toISOString())) {
            studentsByDate[currentDate.toISOString()].push(currentStudentId);
            eventByDate[currentDate.toISOString()].push(event);
          } else {
            studentsByDate[currentDate.toISOString()] = [currentStudentId];
            eventByDate[currentDate.toISOString()] = [event];
          }

          if (Object.prototype.hasOwnProperty.call(eventCountByStudent, currentStudentId)) {
            eventCountByStudent[currentStudentId] += 1;
          } else {
            eventCountByStudent[currentStudentId] = 1;
          }
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return c.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
}, $apis.activityLogger($app));
