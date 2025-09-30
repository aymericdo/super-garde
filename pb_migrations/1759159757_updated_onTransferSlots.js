/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god') || from != \"\" || to = @request.auth.id "
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.role = 'assistant' || @request.auth.role = 'god') || from = @request.auth.id || to = @request.auth.id "
  }, collection)

  return app.save(collection)
})
