/// <reference path="../pb_data/types.d.ts" />

onBootstrap((e) => {
  e.next()
  const utils = require(`${__hooks}/helpers/utils.js`);
  utils.hello("world");
})
