/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id)"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start = start && @request.data.end = end && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id)"

  return dao.saveCollection(collection)
})
