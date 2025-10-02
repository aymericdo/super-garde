
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/download-all-on-call-slots", (e) => {
  const authRecord = e.auth

  if (!['god', 'assistant'].includes(authRecord?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  const onCallSlots = $app.findAllRecords("onCallSlots")
  $app.expandRecords(onCallSlots, ['student'], null);

  return e.json(200, onCallSlots);
});
