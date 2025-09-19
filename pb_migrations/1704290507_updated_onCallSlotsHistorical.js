/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.listRule = null

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.listRule = "@request.auth.id != \"\""

  return app.save(collection)
})
