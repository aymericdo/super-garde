/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx")

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

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx")

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

  return app.save(collection)
})
