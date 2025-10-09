/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
  if (!e.record) return;

  e.record.set("state", "progress")

  e.next()
}, "onExchangeSlots");

onRecordCreate((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const toSlot = $app.findRecordById('onCallSlots', e.record.get('toSlot'))

  const { slotStudentValidation } = require(`${__hooks}/helpers/utils.js`);

  if (toSlot.get('isOnMarket') || slot.get('isOnMarket')) {
    throw 'is on market right now'
  } else if (toSlot.get('isOnTransfer') || slot.get('isOnTransfer')) {
    throw 'is on transfer right now'
  } else if (toSlot.get('isOnExchange') || slot.get('isOnExchange')) {
    throw 'is on exchange right now'
  }

  $app.expandRecord(e.record, ['to'], null);
  const toStudent = e.record.expandedOne('to');
  const validation1 = slotStudentValidation(slot, toStudent)
  if (validation1) {
    throw validation1.toString()
  }

  $app.expandRecord(e.record, ['from'], null);
  const fromStudent = e.record.expandedOne('from');
  const validation2 = slotStudentValidation(toSlot, fromStudent)
  if (validation2) {
    throw validation2.toString()
  }

  e.next()
}, "onExchangeSlots");

onRecordAfterCreateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const toSlot = $app.findRecordById('onCallSlots', e.record.get('toSlot'))

  slot.set("isOnExchange", true)
  $app.save(slot)

  toSlot.set("isOnExchange", true)
  $app.save(toSlot)

  e.next()
}, "onExchangeSlots");

// Abort the exchange

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const toSlot = $app.findRecordById('onCallSlots', e.record.get('toSlot'))

  const oldState = e.record.original().get('state')
  const newState = e.record.get('state')

  if (oldState === 'progress' && newState !== oldState) {
    slot.set("isOnExchange", false)
    $app.save(slot)

    toSlot.set("isOnExchange", false)
    $app.save(toSlot)
  }

  e.next()
}, "onExchangeSlots");

// Accept the exchange
onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const slot = $app.findRecordById('onCallSlots', e.record.get('slot'))
  const toSlot = $app.findRecordById('onCallSlots', e.record.get('toSlot'))

  const oldState = e.record.original().get('state')
  const newState = e.record.get('state')
  const student = e.record.get('to')
  const fromStudent = e.record.get('from')

  if (oldState === 'progress' && newState === 'done') {
    slot.set("student", student)
    $app.save(slot)

    toSlot.set("student", fromStudent)
    $app.save(toSlot)
  }

  e.next()
}, "onExchangeSlots");