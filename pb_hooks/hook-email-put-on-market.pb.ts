
/// <reference path="../pb_data/types.d.ts" />

onModelAfterUpdateSuccess((e) => {
  const oldStudentId = e.model?.original().get("student");
  const oldValue = e.model?.original()
  const newValue = e.model;

  const oldIsOnMarketValue = oldValue?.get("isOnMarket");
  const newIsOnMarketValue = newValue?.get("isOnMarket");
  
  if (oldIsOnMarketValue !== newIsOnMarketValue) {
    const email = require(`${__hooks}/helpers/email.js`);
    try {
      email.putOnMarket(e.model, oldStudentId, { $app, MailerMessage, $os, __hooks });
    } catch (err) {
      console.error(err);
    }
  }

  e.next()
}, "onCallSlots");
