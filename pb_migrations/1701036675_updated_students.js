/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_LAuaLGR` ON `students` (`user`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r5kepggw",
    "name": "user",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_LAuaLGR` ON `students` (`userId`)"
  ]

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "r5kepggw",
    "name": "userId",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return app.saveCollection(collection)
})
