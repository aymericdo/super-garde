
/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const oldStudentId = e.record.original().get("student");
  const oldValue = e.record.original()
  const newValue = e.record;

  const oldIsOnMarketValue = oldValue?.get("isOnMarket");
  const newIsOnMarketValue = newValue?.get("isOnMarket");
  
  if (oldIsOnMarketValue !== newIsOnMarketValue) {
    const email = require(`${__hooks}/helpers/email.js`);
    try {
      email.putOnMarket(e.record, oldStudentId, { $app, MailerMessage, $os, __hooks });
    } catch (err) {
      console.error(err);
    }
  }

  e.next()
}, "onCallSlots");
