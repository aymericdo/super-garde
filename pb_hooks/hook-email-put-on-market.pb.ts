// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

onModelAfterUpdateSuccess((e) => {
  const oldStudentId = e.model.originalCopy().get("student");
  const oldValue = e.model.originalCopy()
  const newValue = e.model;

  const oldIsOnMarketValue = oldValue.get("isOnMarket");
  const newIsOnMarketValue = newValue.get("isOnMarket");

  if (oldIsOnMarketValue !== newIsOnMarketValue) {
    // eslint-disable-next-line
    const email = require(`${__hooks}/helpers/email.js`);
    try {
      email.putOnMarket(e.model, oldStudentId, { $app, MailerMessage, $os, __hooks });
    } catch (err) {
      console.error(err);
    }
  }

  e.next()
}, "onCallSlots");
