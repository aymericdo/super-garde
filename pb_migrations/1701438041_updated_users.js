/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.deleteRule = "@request.auth.id != \"\" && (@request.auth.role = 'admin' || @request.auth.role = 'god')"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("_pb_users_auth_")

  collection.deleteRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
})
