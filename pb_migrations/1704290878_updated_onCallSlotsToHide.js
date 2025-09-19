/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "o2nwlgrz",
    "name": "onCallSlotId",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("44mk8b2wdsxwsrl")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "o2nwlgrz",
    "name": "onCallSlotsId",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return app.save(collection)
})
