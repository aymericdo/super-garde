/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  // update collection data
  unmarshal({
    "name": "xxxonCallSlotsToHide"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  // update collection data
  unmarshal({
    "name": "_onCallSlotsToHide"
  }, collection)

  return app.save(collection)
})
