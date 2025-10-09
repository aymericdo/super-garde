/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  if (!e.record) return;

  e.record.set("state", "progress")

  e.next()
}, "onTransferSlots");

onRecordCreate((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))

  const { slotStudentValidation } = require(`${__hooks}/helpers/utils.js`);

  if (slot.get('isOnMarket')) {
    throw 'is on market right now'
  } else if (slot.get('isOnTransfer')) {
    throw 'is on transfer right now'
  } else if (slot.get('isOnExchange')) {
    throw 'is on exchange right now'
  }
  
  $app.expandRecord(e.record, ['to'], null);
  const toStudent = e.record.expandedOne('to');
  const validation = slotStudentValidation(slot, toStudent)
  if (validation) {
    throw validation.toString()
  }

  e.next()
}, "onTransferSlots");

onRecordAfterCreateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  slot.set("isOnTransfer", true)
  $app.save(slot)

  e.next()
}, "onTransferSlots");

// Abort the transfer

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const oldState = e.record.original().get('state')
  const newState = e.record.get('state')

  if (oldState === 'progress' && newState !== oldState) {
    slot.set("isOnTransfer", false)
    $app.save(slot)
  }

  e.next()
}, "onTransferSlots");

// Accept the transfer

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const oldState = e.record.original().get('state')
  const newState = e.record.get('state')
  const student = e.record.get('to')

  if (oldState === 'progress' && newState === 'done') {
    slot.set("student", student)
    $app.save(slot)
  }

  e.next()
}, "onTransferSlots");