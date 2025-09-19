/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.deleteRule = "@request.auth.id != \"\""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.deleteRule = null

  return app.save(collection)
})
