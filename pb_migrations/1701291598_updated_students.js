/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.listRule = "@request.auth.id != \"\""

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.listRule = "@request.auth.id != \"\" && user.id = @request.auth.id"

  return app.save(collection)
})
