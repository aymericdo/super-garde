/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.createRule = "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"
  collection.updateRule = "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"
  collection.deleteRule = "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.createRule = "@request.auth.id != \"\" && (@request.auth.role = 'admin' || @request.auth.role = 'god')"
  collection.updateRule = "@request.auth.id != \"\" && (@request.auth.role = 'admin' || @request.auth.role = 'god')"
  collection.deleteRule = "@request.auth.id != \"\" && (@request.auth.role = 'admin' || @request.auth.role = 'god')"

  return app.save(collection)
})
