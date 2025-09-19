/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.viewRule = "@request.auth.id != \"\" && ((@request.auth.role = 'assistant' || @request.auth.role = 'god') || @request.auth.id = user.id)"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.viewRule = "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return app.save(collection)
})
