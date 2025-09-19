/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx")

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

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx")

  collection.options = {
    "query": "SELECT id FROM onCallSlots;"
  }

  // remove
  collection.schema.removeField("mwqpmnjg")

  return app.saveCollection(collection)
})
