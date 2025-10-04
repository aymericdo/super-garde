
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

  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();
  const period = (month >= 10) ?
    // Octobre à décembre
    [new Date(year, 9, 1), new Date(year + 1, 8, 30)]
  : (month <= 4) ?
    // Janvier à avril
    [new Date(year - 1, 9, 1), new Date(year, 8, 30)]
  :
    // Mai à septembre
    [new Date(year - 1, 9, 1), new Date(year, 8, 30)];

  students.forEach((student) => {
    const onCallCount2025 = student.get('onCallCount2025')
    const totalOnCallCount = student.get('totalOnCallCount')

    // const studentFilter = $dbx.exp("student = {:student}", { student: student.id })
    // const uhcdFilter = $dbx.exp("sector != {:uhcdFilter}", { uhcdFilter: 'UHCD' })
    // const dateFilter = $dbx.exp("start > {:start} AND end <= {:end}", {
    //   start: period[0].toISOString(),
    //   end: period[1].toISOString(),
    // })
    // const onCallSlotsCount = $app.countRecords("onCallSlots", studentFilter, dateFilter, uhcdFilter)
    // TODO: ^ faire x2 si WE ou ferié

    // const threeYearsAgo = new Date(period[0])
    // threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 2)
    // const totalDateFilter = $dbx.exp("start > {:start} AND end <= {:end}", {
    //   start: threeYearsAgo.toISOString(),
    //   end: period[1].toISOString(),
    // })
    // const totalOnCallSlotsCount = $app.countRecords("onCallSlots", studentFilter, totalDateFilter)
    // TODO: ^ faire x2 si WE ou ferié

    eventCountByStudent[student.id] = onCallCount2025 // onCallSlotsCount
    totalEventCountByStudent[student.id] = totalOnCallCount // totalOnCallSlotsCount

    if (student.get('year') === 'MM3') {
      MM3studentIds.push(student.id)
    }
  })

  const currentDate = startDate;

  while (currentDate < endDate) {
    const dateKey = currentDate.toISOString();
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6; // dimanche=0, samedi=6
    const isHoliday = holidays.some((h) => h.toDateString() === currentDate.toDateString());
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

        function isParisSummerTime(date) {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          
          // Heure d'été : dernier dimanche de mars à dernier dimanche d'octobre
          const march = new Date(year, 2, 31); // 31 mars
          const lastSundayMarch = new Date(march.getTime() - (march.getDay() * 24 * 60 * 60 * 1000));
          
          const october = new Date(year, 9, 31); // 31 octobre  
          const lastSundayOctober = new Date(october.getTime() - (october.getDay() * 24 * 60 * 60 * 1000));
          
          const currentDateOnly = new Date(year, month, day);
          return currentDateOnly >= lastSundayMarch && currentDateOnly < lastSundayOctober;
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

          // Créer les dates en heure de Paris (fonctionne même si le serveur est en UTC)
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const day = currentDate.getDate();
          
          const parisOffset = isParisSummerTime(currentDate) ? 2 : 1; // UTC+2 en été, UTC+1 en hiver

          const dayOfWeek = currentDate.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi

          let onCallHours = null
          if (dayOfWeek === 0 || isHoliday) {
            // Dimanche ou jour férié : 8h30-8h30 (jour suivant)
            onCallHours = { startHour: 8, startMinute: 30, endHour: 8, endMinute: 30, nextDay: true };
          } else if (dayOfWeek === 6) {
            // Samedi : 12h30-8h30 (jour suivant)
            onCallHours = { startHour: 12, startMinute: 30, endHour: 8, endMinute: 30, nextDay: true };
          } else {
            // Semaine (lundi-vendredi) : 18h30-8h30 (jour suivant)
            onCallHours = { startHour: 18, startMinute: 30, endHour: 8, endMinute: 30, nextDay: true };
          }

          const startEventDate = new Date(Date.UTC(
            year, 
            month, 
            day, 
            onCallHours.startHour - parisOffset, 
            onCallHours.startMinute, 
            0
          ));
          
          const endEventDate = new Date(Date.UTC(
            year, 
            month, 
            onCallHours.nextDay ? day + 1 : day, 
            onCallHours.endHour - parisOffset, 
            onCallHours.endMinute, 
            0
          ));

          const event = {
            start: startEventDate,
            end: endEventDate,
            hospital,
            sector,
          }

          const dbCreate = require(`${__hooks}/helpers/db-create.js`);
          const slot = dbCreate.onCallSlot(event, currentStudentId, { $app });
          $app.expandRecord(slot, ['student'], null);
          const student = slot.expandedOne('student');

          // init arrays si pas encore
          if (!Object.prototype.hasOwnProperty.call(studentsByDate, dateKey)) {
            studentsByDate[dateKey] = [];
            eventByDate[dateKey] = [];
          }

          studentsByDate[dateKey].push(currentStudentId);

          eventByDate[dateKey].push(event);
          lastEventDateByStudent[currentStudentId] = new Date(currentDate);

          const studentYear = student.get('year')
          // calcul du poids de la journée
          const weight = (studentYear !== 'MM3' && isUHCD) ? 0 : (isWeekend || isHoliday) ? 2 : 1;

          // incrément pondéré
          eventCountByStudent[currentStudentId] = (eventCountByStudent[currentStudentId] ?? 0) + weight;
        }
      });
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return e.json(200, { "generation-status": 'OK', students, studentsByDate, eventByDate, eventCountByStudent });
});
