/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = "@request.auth.id != \"\""
  collection.updateRule = "@request.auth.id != \"\""

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  collection.viewRule = null
  collection.updateRule = ""

  return dao.saveCollection(collection)
})
