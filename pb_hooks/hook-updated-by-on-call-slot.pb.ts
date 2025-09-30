/// <reference path="../pb_data/types.d.ts" />

onRecordUpdateRequest((e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (e.record && authRecord && !isSuperuser) {
    e.record.set(
      'updatedBy',
      authRecord.id,
    );
  }

  e.next()
}, "onCallSlots");
