/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/get-stalked-slots", (e) => {
  const authRecord = e.auth

  if (!authRecord) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  let stalkedStudent = null
  if (e.request?.url) {
    stalkedStudent = e.request.url.query().get("stalkedStudent")
  }

  if (!stalkedStudent) {
    throw new BadRequestError('stalkedStudent is required', {})
  }

  try {
    const consent = $app.findRecordsByFilter(
      "stalkOnCallsConsent",
      "stalker = {:currentUser} && stalked = {:stalkedStudent} && consent = true && expiration > @now",
      "-updated",
      1,
      0,
      {
        currentUser: authRecord.id,
        stalkedStudent,
      },
    )[0];

    if (!consent) throw 'no consent'

    const studentFilter = $dbx.exp("student = {:stalkedStudent}", { stalkedStudent })
    const futurFilter = $dbx.exp("start > {:now}", { now: new Date().toISOString() })

    const slots = $app.findAllRecords("onCallSlots", studentFilter, futurFilter)
    $app.expandRecords(slots, ['student'], null);

    return e.json(200, { slots });
  } catch (error) {
    return e.json(401, { message: 'give the consent first' });
  }
});
