/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add
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

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove
  collection.schema.removeField("ocihlhu3")

  return app.saveCollection(collection)
})
