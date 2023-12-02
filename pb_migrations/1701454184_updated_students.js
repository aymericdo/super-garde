/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.updateRule = "@request.auth.id != \"\" && firstName = @request.data.firstName && lastName = @request.data.lastName && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.updateRule = "@request.auth.id != \"\" && firstName = @request.data.firstName && (@request.auth.role = 'assistant' || @request.auth.role = 'god')"

  return dao.saveCollection(collection)
})
