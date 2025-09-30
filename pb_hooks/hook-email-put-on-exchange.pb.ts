
/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const oldValue = e.record.original()
  const newValue = e.record;

  const oldIsOnExchangeValue = oldValue?.get("isOnExchange");
  const newIsOnExchangeValue = newValue?.get("isOnExchange");
  
  if (oldIsOnExchangeValue !== newIsOnExchangeValue) {
    const email = require(`${__hooks}/helpers/email.js`);
    try {
      email.putOnExchange(e.record, { $app, MailerMessage, __hooks });
    } catch (err) {
      console.error(err);
    }
  }

  e.next()
}, "onCallSlots");
