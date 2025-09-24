
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/create-all-events", (e) => {
  const authRecord = e.auth

  const data = require(`${__hooks}/helpers/data.js`);
  const holidays = data.holidays();
  const blockedPeriods = data.blockedPeriods();

  let startDate = new Date()
  let endDate = new Date()

  if (e.request?.url) {
    startDate = new Date(e.request.url.query().get("startDate"))
    endDate = new Date(e.request.url.query().get("endDate"))
  }
 
  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const SECTORS_BY_HOSPITAL = {
    'Trousseau': [
      ['Chirurgie', '*'],
      ['Psychiatrie', '*'],
      ['Urgence secteur 1 - 2', '*'],
      ['Urgence secteur 1 - 2', '*'],
      ['Urgence secteur 3', '*'],
      ['Urgence secteur 3', '*'],
      ['Urgence secteur 3', '*'],
      ['USCI Cardiologie', '*'],
      ['URTC', 'MM1;MM2'],
      ['UHCD', '*'],
    ],
    'Bretonneau': [
      ['Étage', '*'],
      ['Gynécologie', '*'],
      ['Obstétrique', '*'],
      ['Réanimation 1 - 2', '*'],
      ['Réanimation 3 - 4', '*'],
    ],
    'Clocheville': [
      ['Pédiatrie', '*'],
      ['Pédiatrie', '*'],
    ],
  };

  const studentsByDate = {};
  const eventByDate = {};
  const eventCountByStudent = {};
  const lastEventDateByStudent = {};
  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  $app.runInTransaction((txApp) => {
    const currentDate = startDate;

    while (currentDate < endDate) {
      Object.keys(SECTORS_BY_HOSPITAL).forEach((hospital) => {
        SECTORS_BY_HOSPITAL[hospital].forEach(([sector, year]) => {
          // defensive safeguard to avoid double booking
          const alreadyBookedStudentIds = Object.prototype.hasOwnProperty.call(studentsByDate, currentDate.toISOString())
            ? studentsByDate[currentDate.toISOString()]
            : [];
          
          let minCount = null;
          const relevantIds = [];

          function isInBlockedPeriod(year, date) {
            const periods = blockedPeriods[year] ?? [];
            return periods.some(([start, end]) => date >= start && date <= end);
          }

          function daysBetween(d1, d2) {
            return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
          }

          for (const student of students) {
            const studentYear = student.get('year');
            const yearValid = year === '*' || year.split(';').includes(studentYear);
            const uhcdValid = sector !== 'UHCD' || student.get('UHCD');
            const id = student.get('id');

            if (yearValid && uhcdValid && !alreadyBookedStudentIds.includes(id) && !isInBlockedPeriod(studentYear, currentDate)) {
              const count = eventCountByStudent[id] ?? 0;

              // Vérifier l'intervalle entre les gardes
              const lastDate = lastEventDateByStudent[id];
              const tooClose = lastDate && Math.abs(daysBetween(currentDate, lastDate)) < 2;

              if (tooClose) {
                continue; // on skip cet étudiant
              }

              if (minCount === null || count < minCount) {
                // nouveau minimum trouvé → on reset la liste
                minCount = count;
                relevantIds.length = 0;
                relevantIds.push(id);
              } else if (count === minCount) {
                // égal au minimum actuel → on l’ajoute aussi
                relevantIds.push(id);
              }
            }
          }

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
          dbCreate.onCallSlot(event, currentStudentId, { $app, txApp });

          const dateKey = currentDate.toISOString();

          // init arrays si pas encore
          if (!studentsByDate[dateKey]) {
            studentsByDate[dateKey] = [];
            eventByDate[dateKey] = [];
          }

          studentsByDate[dateKey].push(currentStudentId);
          eventByDate[dateKey].push(event);
          lastEventDateByStudent[currentStudentId] = currentDate;

          // calcul du poids de la journée
          const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6; // dimanche=0, samedi=6
          const isHoliday = holidays.some((h) => h.toDateString() === currentDate.toDateString()); 

          const weight = (isWeekend || isHoliday) ? 2 : 1;

          // incrément pondéré
          eventCountByStudent[currentStudentId] = (eventCountByStudent[currentStudentId] ?? 0) + weight;
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return e.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
});
