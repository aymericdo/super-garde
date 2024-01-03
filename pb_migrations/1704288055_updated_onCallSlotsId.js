/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wncbk6rmhyq5uyx")

  collection.options = {
    "query": "SELECT id, isOnMarket FROM onCallSlots;"
  }

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("wncbk6rmhyq5uyx")

  collection.options = {
    "query": "SELECT id FROM onCallSlots;"
  }

  // remove
  collection.schema.removeField("mwqpmnjg")

  return dao.saveCollection(collection)
})
