/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.updateRule = ""

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.updateRule = null

  return app.saveCollection(collection)
})
