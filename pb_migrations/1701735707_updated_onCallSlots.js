/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && start = @request.data.start && end = @request.data.end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (((student = '' || isOnMarket = true) && @request.data.student.user.id = @request.auth.id) || student.user = @request.auth.id))"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && start = @request.data.start && end = @request.data.end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (((student = '' || isOnMarket = true) && @request.data.student.user = @request.auth.id) || student.user = @request.auth.id))"

  return dao.saveCollection(collection)
})
