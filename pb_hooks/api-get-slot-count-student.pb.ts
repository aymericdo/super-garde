/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/get-slot-count-student", (e) => {
  const authRecord = e.auth

  if (!authRecord) {
    throw 'unauthorized'
  }

  const { getTotalYearCount } = require(`${__hooks}/helpers/utils.js`);
  
  const studentIdsStr = e.requestInfo().query["studentIds"]
  
  if (!studentIdsStr) {
    throw 'studentIds is required'
  }

  const studentIds = studentIdsStr.split(',')

  let studentRecord = null
  try {
    studentRecord = $app.findFirstRecordByFilter('students', "user = {:user}", { user: authRecord.id });
  } catch (error) {
    console.error("no student");
  }

  const validStudent = studentRecord ? (studentIds.length === 1 && studentIds[0] === studentRecord.id) : false;

  if (!(validStudent || ['god', 'assistant'].includes(authRecord?.get('role')))) {
    throw new UnauthorizedError('You are not important enough', {})
  }
  
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

  const manualFilter = $dbx.exp("manualSaved = false OR validated = true")
  const dateFilter = $dbx.exp("start > {:start} AND end <= {:end}", {
    start: period[0].toISOString(),
    end: period[1].toISOString(),
  })
  const dateFilterDone = $dbx.exp("start > {:start} AND end <= {:now}", {
    start: period[0].toISOString(),
    now: new Date().toISOString(),
  })
  const onCallSlots = $app.findAllRecords("onCallSlots", dateFilter, manualFilter)
  const onCallSlotsDone = $app.findAllRecords("onCallSlots", dateFilterDone, manualFilter)

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

  const slotsDoneByStudentId = onCallSlotsDone.reduce((acc, slot) => {
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
  const totalDateFilterDone = $dbx.exp("start > {:start} AND end <= {:now}", {
    start: threeYearsAgo.toISOString(),
    now: new Date().toISOString(),
  })
  const totalOnCallSlots = $app.findAllRecords("onCallSlots", totalDateFilter, manualFilter)
  const totalOnCallSlotsDone = $app.findAllRecords("onCallSlots", totalDateFilterDone, manualFilter)

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

  const totalSlotsDoneByStudentId = totalOnCallSlotsDone.reduce((acc, slot) => {
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
    acc[studentId] = {
      year: (slotsByStudentId.hasOwnProperty(studentId) ? getTotalYearCount(slotsByStudentId[studentId]) : 0),
      yearDone: (slotsDoneByStudentId.hasOwnProperty(studentId) ? getTotalYearCount(slotsDoneByStudentId[studentId]) : 0),
      threeYear: (totalSlotsByStudentId.hasOwnProperty(studentId) ? getTotalYearCount(totalSlotsByStudentId[studentId]) : 0),
      threeYearDone: (totalSlotsDoneByStudentId.hasOwnProperty(studentId) ? getTotalYearCount(totalSlotsDoneByStudentId[studentId]) : 0),
    }

    return acc
  }, {})

  return e.json(200, { ...countsByStudent });
})