/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ttvhf5ph",
    "name": "role",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "student",
        "admin",
        "god"
      ]
    }
  }))

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove
  collection.schema.removeField("ttvhf5ph")

  return app.save(collection)
})
