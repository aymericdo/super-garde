/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_LAuaLGR` ON `students` (`userId`)"
  ]

  // remove
  collection.schema.removeField("krntgrpw")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

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

  return dao.saveCollection(collection)
})
