/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || student.user = @request.auth.id || isOnMarket = true))"
  collection.updateRule = "@request.auth.id != \"\" && start = @request.data.start && end = @request.data.end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || student.user = @request.auth.id || isOnMarket = true))"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || student.user = @request.auth.id))"
  collection.updateRule = "@request.auth.id != \"\" && start = @request.data.start && end = @request.data.end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || student.user = @request.auth.id))"

  return dao.saveCollection(collection)
})
