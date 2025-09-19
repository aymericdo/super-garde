/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_LAuaLGR` ON `students` (`userId`)"
  ]

  // remove
  collection.schema.removeField("krntgrpw")

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_xfXFzGw` ON `students` (`email`)",
    "CREATE UNIQUE INDEX `idx_LAuaLGR` ON `students` (`userId`)"
  ]

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "krntgrpw",
    "name": "email",
    "type": "email",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": null
    }
  }))

  return app.saveCollection(collection)
})
