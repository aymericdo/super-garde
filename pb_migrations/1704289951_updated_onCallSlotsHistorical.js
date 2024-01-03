/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.viewRule = null

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.viewRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
})
