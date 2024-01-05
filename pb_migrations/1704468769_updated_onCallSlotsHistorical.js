/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("nizuxmlvx1vnfz4")

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

  return dao.saveCollection(collection)
})
