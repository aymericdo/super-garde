/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"
  collection.createRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"
  collection.deleteRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = null
  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return app.save(collection)
})
