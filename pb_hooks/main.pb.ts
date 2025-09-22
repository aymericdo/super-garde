/// <reference path="../pb_data/types.d.ts" />

// Read the .env file and set the environment variables.
onBootstrap((e) => {
  e.next()
  require(`${__hooks}/lib/env.js`);
})
