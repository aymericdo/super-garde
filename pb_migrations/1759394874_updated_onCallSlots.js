/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.query.filter ~ 'hospital=\"' )"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.query.filter ~ \"hospital='\" )"
  }, collection)

  return app.save(collection)
})
