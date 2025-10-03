/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (e.record && authRecord && !isSuperuser) {
    e.record.set(
      'manualSaved',
      true,
    );
  }

  e.next()
}, "onCallSlots");
