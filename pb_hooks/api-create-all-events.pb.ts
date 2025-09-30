
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/create-all-events", (e) => {
  const authRecord = e.auth

  const data = require(`${__hooks}/helpers/data.js`);
  const holidays = data.holidays();
  const blockedPeriods = data.blockedPeriods();
  const sectorsByHospital = data.sectorsByHospital();

  let startDate = new Date()
  let endDate = new Date()

  if (e.request?.url) {
    startDate = new Date(e.request.url.query().get("startDate"))
    endDate = new Date(e.request.url.query().get("endDate"))
  }
 
  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const studentsByDate = {};
  const eventByDate = {};
  const eventCountByStudent = {};
  const lastEventDateByStudent = {};
  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  $app.runInTransaction((txApp) => {
    const currentDate = startDate;

    while (currentDate < endDate) {
      const dateKey = currentDate.toISOString();
      Object.keys(sectorsByHospital).forEach((hospital) => {
        sectorsByHospital[hospital].forEach(([sector, year]) => {
          // defensive safeguard to avoid double booking
          const alreadyBookedStudentIds = Object.prototype.hasOwnProperty.call(studentsByDate, dateKey)
            ? studentsByDate[dateKey]
            : [];

          const isUHCD = sector === 'UHCD'
          let minCount = null;
          let relevantIds = [];

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
            const uhcdValid = !isUHCD || student.get('UHCD');
            const id = student.get('id');

            // Vérifier l'intervalle entre les gardes
            const lastDate = lastEventDateByStudent[id];
            const tooClose = lastDate && Math.abs(daysBetween(currentDate, lastDate)) < 1;

            if (!tooClose && yearValid && uhcdValid && !alreadyBookedStudentIds.includes(id) && !isInBlockedPeriod(studentYear, currentDate)) {
              const count = eventCountByStudent[id] ?? 0;

              if (minCount === null || count < minCount) {
                // nouveau minimum trouvé → on reset la liste
                minCount = count;
                relevantIds = [id];
              } else if (count === minCount) {
                // égal au minimum actuel → on l’ajoute aussi
                relevantIds.push(id);
              }
            }
          }

          if (relevantIds.length) {
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
            dbCreate.onCallSlot(event, currentStudentId, { $app: txApp });

            // init arrays si pas encore
            if (!Object.prototype.hasOwnProperty.call(studentsByDate, dateKey)) {
              studentsByDate[dateKey] = [];
              eventByDate[dateKey] = [];
            }

            studentsByDate[dateKey].push(currentStudentId);

            eventByDate[dateKey].push(event);
            lastEventDateByStudent[currentStudentId] = new Date(currentDate);

            // calcul du poids de la journée
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6; // dimanche=0, samedi=6
            const isHoliday = holidays.some((h) => h.toDateString() === currentDate.toDateString()); 

            const weight = isUHCD ? 0 : (isWeekend || isHoliday) ? 2 : 1;

            // incrément pondéré
            eventCountByStudent[currentStudentId] = (eventCountByStudent[currentStudentId] ?? 0) + weight;
          }
        });
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return e.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
});
