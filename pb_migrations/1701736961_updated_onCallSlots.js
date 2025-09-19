/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ocihlhu3",
    "name": "isOnMarket",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ocihlhu3",
    "name": "isOnMarket",
    "type": "bool",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {}
  }))

  return app.save(collection)
})
