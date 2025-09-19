/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove
  collection.schema.removeField("qi29u2xw")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "hp3mbepd",
    "name": "hospital",
    "type": "select",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "Trousseau",
        "Bretonneau",
        "Clocheville"
      ]
    }
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "qi29u2xw",
    "name": "hospital",
    "type": "text",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("hp3mbepd")

  return app.save(collection)
})
