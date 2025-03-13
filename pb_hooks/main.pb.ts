// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  // eslint-disable-next-line
  const utils = require(`${__hooks}/helpers/utils.js`);
  utils.hello("world");

  e.next()
})
