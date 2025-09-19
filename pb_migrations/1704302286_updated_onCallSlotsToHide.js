/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.id != \"\""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = null
  collection.updateRule = ""

  return app.save(collection)
})
