/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.listRule = "@request.auth.id != \"\""

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.listRule = null

  return app.save(collection)
})
