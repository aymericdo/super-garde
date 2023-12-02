/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"admin\")\n || (student = '' || student.user = @request.auth.id))"
  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"admin\")\n || (student = '' || student.user = @request.auth.id))"
  collection.createRule = "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"admin\")"
  collection.updateRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"admin\")\n || (student = '' || student.user = @request.auth.id))"
  collection.deleteRule = "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"admin\")"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"
  collection.viewRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"
  collection.createRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"
  collection.deleteRule = "@request.auth.id != \"\" && (student = '' || student.user = @request.auth.id)"

  return dao.saveCollection(collection)
})
