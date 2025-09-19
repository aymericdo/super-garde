/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.updateRule = "@request.auth.id != \"\" && firstName = @request.data.firstName && lastName = @request.data.lastName && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.updateRule = "@request.auth.id != \"\" && firstName = @request.data.firstName && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return app.save(collection)
})
