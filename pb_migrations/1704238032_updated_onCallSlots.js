/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true || isOnMarket = false) && @request.data.student.user.id = @request.auth.id))"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id || (isOnMarket = false)))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true) && @request.data.student.user.id = @request.auth.id))"

  return dao.saveCollection(collection)
})
