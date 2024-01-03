/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wncbk6rmhyq5uyx")

  collection.name = "onCallSlotsIds"

  // remove
  collection.schema.removeField("mwqpmnjg")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cafdtozj",
    "name": "isOnMarket",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wncbk6rmhyq5uyx")

  collection.name = "onCallSlotsId"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mwqpmnjg",
    "name": "isOnMarket",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("cafdtozj")

  return dao.saveCollection(collection)
})
