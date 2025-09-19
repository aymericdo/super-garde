/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.id != \"\""

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = null
  collection.updateRule = ""

  return app.saveCollection(collection)
})
