
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/create-all-events", (e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  let startDate = new Date()
  let endDate = new Date()

  if (e.request?.url) {
    startDate = new Date(e.request.url.query().get("startDate"))
    endDate = new Date(e.request.url.query().get("endDate"))
  }
 
  if (!isSuperuser && !['god', 'assistant'].includes(authRecord?.get('role'))) {
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

          const relevantIds = validStudentIds.filter(id =>
            eventCountByStudent[validStudentIds[0]] === eventCountByStudent[id]);

          if (!relevantIds.length) return;

          
          const utils = require(`${__hooks}/helpers/utils.js`);
          const currentStudentId = utils.randomItemFromList(relevantIds);

          const startEventDate = new Date(currentDate);
          const endEventDate = new Date(currentDate);
          startEventDate.setHours(18);
          startEventDate.setMinutes(0);
          startEventDate.setSeconds(0);
          endEventDate.setHours(19);
          endEventDate.setMinutes(0);
          endEventDate.setSeconds(0);

          const event = {
            start: startEventDate,
            end: endEventDate,
            hospital,
            sector,
          }

          
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

  return e.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
});
