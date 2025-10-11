/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/get-slot-count-student", (e) => {
  const authRecord = e.auth

  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    // throw new UnauthorizedError('You are not important enough', {})
  }

  const studentIds = e.request.url.query().get("studentIds[]")
  console.log(JSON.stringify(studentIds))
  
  if (!studentIds) {
    throw 'studentIds is required'
  }
  
  const { getTotalYearCount } = require(`${__hooks}/helpers/utils.js`);
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const period = (month >= 10) ?
    // Octobre à décembre
    [new Date(year, 9, 1), new Date(year + 1, 8, 30)]
  : (month <= 4) ?
    // Janvier à avril
    [new Date(year - 1, 9, 1), new Date(year, 8, 30)]
  :
    // Mai à septembre
    [new Date(year - 1, 9, 1), new Date(year, 8, 30)];

  const uhcdFilter = $dbx.exp("sector != {:uhcdFilter}", { uhcdFilter: 'UHCD' })
  const dateFilter = $dbx.exp("start > {:start} AND end <= {:end}", {
    start: period[0].toISOString(),
    end: period[1].toISOString(),
  })
  const onCallSlots = $app.findAllRecords("onCallSlots", dateFilter, uhcdFilter)

  const slotsByStudentId = onCallSlots.reduce((acc, slot) => {
    if (slot?.get('student')) {
      if (acc.hasOwnProperty(slot?.get('student'))) {
        acc[slot.get('student')].push(slot)
      } else {
        acc[slot.get('student')] = [slot]
      }
    }
    return acc
  }, {})

  const threeYearsAgo = new Date(period[0])
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 2)
  const totalDateFilter = $dbx.exp("start > {:start} AND end <= {:end}", {
    start: threeYearsAgo.toISOString(),
    end: period[1].toISOString(),
  })
  const totalOnCallSlots = $app.findAllRecords("onCallSlots", totalDateFilter)

  const totalSlotsByStudentId = totalOnCallSlots.reduce((acc, slot) => {
    if (slot?.get('student')) {
      if (acc.hasOwnProperty(slot?.get('student'))) {
        acc[slot.get('student')].push(slot)
      } else {
        acc[slot.get('student')] = [slot]
      }
    }
    return acc
  }, {})

  const countsByStudent = studentIds.reduce((acc, studentId) => {
    if (acc.hasOwnProperty(studentId)) {
      acc[studentId].push({
        year: slotsByStudentId[studentId] ?? getTotalYearCount(slotsByStudentId[studentId]),
        threeYear: totalSlotsByStudentId[studentId] ?? getTotalYearCount(totalSlotsByStudentId[studentId]),
      })
    } else {
      acc[studentId] = [{
        year: slotsByStudentId[studentId] ?? getTotalYearCount(slotsByStudentId[studentId]),
        threeYear: totalSlotsByStudentId[studentId] ?? getTotalYearCount(totalSlotsByStudentId[studentId]),
      }]
    }

    return acc
  }, {})

  return e.json(200, { countsByStudent });
})