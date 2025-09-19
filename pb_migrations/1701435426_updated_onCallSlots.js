/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" && (student.id = '' || @request.auth.id = student.id)"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\""

  return app.save(collection)
})
