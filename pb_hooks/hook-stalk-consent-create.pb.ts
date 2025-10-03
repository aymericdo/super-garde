/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  if (!e.record) return;

  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);

  e.record.set("expiration", now)

  e.next()
}, "stalkOnCallsConsent");