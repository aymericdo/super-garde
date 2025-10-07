/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  const authRecord = e.auth
  const isSuperuser = e.hasSuperuserAuth()

  if (e.record && authRecord && !isSuperuser) {
    e.record.set(
      'manualSaved',
      true,
    );
    e.record.set(
      'validated',
      false,
    );
  }

  e.next()
}, "onCallSlots");

onRecordCreate((e) => {
  if (!e.record) return;

  const manualSaved = e.record.get('manualSaved')

  if (manualSaved) {
    if (!e.record.get('proof')) {
       throw 'attestation is required'
    }
  }

  e.next()
}, "onCallSlots");