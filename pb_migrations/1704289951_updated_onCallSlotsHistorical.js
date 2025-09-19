/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.viewRule = null

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.viewRule = "@request.auth.id != \"\""

  return app.saveCollection(collection)
})
