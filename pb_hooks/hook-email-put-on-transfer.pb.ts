
/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  if (!e.record) return;

  const oldValue = e.record.original()
  const newValue = e.record;

  const oldIsOnTransferValue = oldValue?.get("isOnTransfer");
  const newIsOnTransferValue = newValue?.get("isOnTransfer");

  if (oldIsOnTransferValue !== newIsOnTransferValue) {
    try {
      const email = require(`${__hooks}/helpers/email.js`);
      email.putOnTransfer(e.record, { $app, MailerMessage, __hooks });
    } catch (err) {
      console.error(err);
    }
  }

  e.next()
}, "onCallSlots");
