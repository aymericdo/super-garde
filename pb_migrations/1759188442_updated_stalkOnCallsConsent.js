/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && @request.auth.id = stalker.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update collection data
  unmarshal({
    "listRule": null
  }, collection)

  return app.save(collection)
})
