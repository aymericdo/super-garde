/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.createRule = null

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.createRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
})
