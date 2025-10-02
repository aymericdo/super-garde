/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/get-your-colleagues", (e) => {
  const authRecord = e.auth

  if (!authRecord) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  let slotId = null
  if (e.request?.url) {
    slotId = e.request.url.query().get("slotId")
  }

  if (!slotId) {
    throw new BadRequestError('Slot id is required', {})
  }

  const slot = $app.findRecordById('onCallSlots', slotId)

  const hospitalFilter = $dbx.exp("hospital = {:hospital}", { hospital: slot.get('hospital') })
  const dateFilter = $dbx.exp("start = {:start} AND end = {:end}", {
    start: slot.get('start'),
    end: slot.get('end'),
  })
  const onCallSlots = $app.findAllRecords("onCallSlots", hospitalFilter, dateFilter)
  $app.expandRecords(onCallSlots, ['student'], null);
  const sameDayStudents = onCallSlots.reduce(
    (acc, slot) => {
      if (slot?.get('expand').student) {
        const studentFullName = `${slot.get('expand').student.get('firstName')} ${
          slot.get('expand').student.get('lastName')} (${
            slot.get('expand').student.get('year')})`
        if (acc.hasOwnProperty(slot?.get('sector'))) {
          acc[slot.get('sector')].push(studentFullName)
        } else {
          acc[slot.get('sector')] = [studentFullName]
        }
      }
      return acc
    },
    {},
  )

  return e.json(200, sameDayStudents);
});
