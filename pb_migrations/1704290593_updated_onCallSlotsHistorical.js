/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.listRule = "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\")"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  collection.listRule = null

  return dao.saveCollection(collection)
})
