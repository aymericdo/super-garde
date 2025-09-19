/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.listRule = "@request.auth.id != \"\" && lastName ~ 'Trou'"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.listRule = "@request.auth.id != \"\" && lastName = 'Trougniard'"

  return app.save(collection)
})
