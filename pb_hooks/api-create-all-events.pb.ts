
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
  const lastEventDateByStudent = {};
  const eventCountByStudent = {};
  const totalEventCountByStudent = {};
  const MM3studentIds = [];
  
  const dbRead = require(`${__hooks}/helpers/db-read.js`);
  const students = dbRead.students({ $app });

  let period = null;

  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();
  if (month >= 10) {
    // Octobre à décembre
    period = [new Date(year, 9, 1), new Date(year, 8, 30)];
  } else if (month <= 4) {
    // Janvier à avril
    period = [new Date(year - 1, 9, 1), new Date(year, 8, 30)];
  } else {
    // Mai à septembre
    period = [new Date(year - 1, 9, 1), new Date(year, 8, 30)];
  }

  students.forEach((student) => {
    const onCallCount2025 = student.get('onCallCount2025')
    const totalOnCallCount = student.get('totalOnCallCount')

    // const studentFilter = $dbx.exp("student = {:student}", { student: student.id })
    // const uhcdFilter = $dbx.exp("sector != {:uhcdFilter}", { uhcdFilter: 'UHCD' })
    // const dateFilter = $dbx.exp("start = {:start} AND end = {:end}", {
    //   start: period[0].toString(),
    //   end: period[1].toString(),
    // })
    // const onCallSlotsCount = $app.countRecords("onCallSlots", studentFilter, dateFilter, uhcdFilter)

    // const threeYearsAgo = new Date(period[0])
    // threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 2)
    // const totalDateFilter = $dbx.exp("start = {:start} AND end = {:end}", {
    //   start: threeYearsAgo.toString(),
    //   end: period[1].toString(),
    // })
    // const totalOnCallSlotsCount = $app.countRecords("onCallSlots", studentFilter, totalDateFilter)

    eventCountByStudent[student.id] = onCallCount2025 // onCallSlotsCount
    totalEventCountByStudent[student.id] = totalOnCallCount // totalOnCallSlotsCount

    if (student.get('year') === 'MM3') {
      MM3studentIds.push(student.id)
    }
  })

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

        const stillLessThanFour = Object.values(eventCountByStudent).some((value) => value < 4)
        const MM3stillLessThan25 = Object.keys(eventCountByStudent).some((studentId) => {
          return (MM3studentIds.includes(studentId) && eventCountByStudent[studentId] < 25)
        })

        for (const student of students) {
          const studentYear = student.get('year');
          const yearValid = year === '*' || year.split(';').includes(studentYear);
          const uhcdValid = !isUHCD || student.get('UHCD');
          const id = student.get('id');

          // Vérifier l'intervalle entre les gardes
          const lastDate = lastEventDateByStudent[id];
          const tooClose = lastDate && Math.abs(daysBetween(currentDate, lastDate)) < 1;

          let MM3totalCount = studentYear === 'MM3' ? (totalEventCountByStudent[id] ?? 0) : 0
          MM3totalCount += (eventCountByStudent[id] ?? 0)

          if (!tooClose && yearValid && uhcdValid && !alreadyBookedStudentIds.includes(id) && !isInBlockedPeriod(studentYear, currentDate) && MM3totalCount < 25) {
            if (stillLessThanFour || !MM3stillLessThan25) {
              const count = eventCountByStudent[id] ?? 0;
              if (minCount === null || count < minCount) {
                // nouveau minimum trouvé → on reset la liste
                minCount = count;
                relevantIds = [id];
              } else if (count === minCount) {
                // égal au minimum actuel → on l’ajoute aussi
                relevantIds.push(id);
              }
            } else {
              const rand = Math.random(); // nombre entre 0 et 1
              if (studentYear === 'MM3') {
                if (rand < 0.7) {
                  // 70% de chance de pousser un MM3
                  relevantIds.push(id);
                }
              } else if (studentYear === 'MM1' || studentYear === 'MM2') {
                if (rand >= 0.7) {
                  // 30% de chance de pousser un MM1/MM2
                  relevantIds.push(id);
                }
              }
            }
          }
        }

        if (relevantIds.length) {
          const utils = require(`${__hooks}/helpers/utils.js`);
          const currentStudentId = utils.randomItemFromList(relevantIds);

          // Décalage Paris par rapport à UTC en heures
          // 1 = hiver (UTC+1), 2 = été (UTC+2)
          const parisOffsetHours = 2; // ici été

          const startEventDate = new Date(Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            18 - parisOffsetHours, // 18h Paris → heure UTC
            0, 0
          ));

          const endEventDate = new Date(Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            19 - parisOffsetHours, // 19h Paris → heure UTC
            0, 0
          ));

          const event = {
            start: startEventDate,
            end: endEventDate,
            hospital,
            sector,
          }

          const dbCreate = require(`${__hooks}/helpers/db-create.js`);
          dbCreate.onCallSlot(event, currentStudentId, { $app });

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

  return e.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
});
