/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.viewRule = "@request.auth.id != \"\""

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  collection.viewRule = "id = @request.auth.id"

  return app.save(collection)
})
