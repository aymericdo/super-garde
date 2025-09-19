/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.createRule = null

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.createRule = "@request.auth.id != \"\""

  return app.save(collection)
})
