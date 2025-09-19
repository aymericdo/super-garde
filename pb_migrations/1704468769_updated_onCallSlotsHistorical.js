/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rhw1b370",
    "name": "onCallSlotId",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "amds7pecgcmyimm",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rhw1b370",
    "name": "onCallSlotId",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "amds7pecgcmyimm",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.save(collection)
})
