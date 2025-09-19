/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove
  collection.schema.removeField("w1ebkq3v")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "q8vvuvu2",
    "name": "updateappy",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "w1ebkq3v",
    "name": "updateappy",
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

  // remove
  collection.schema.removeField("q8vvuvu2")

  return app.save(collection)
})
