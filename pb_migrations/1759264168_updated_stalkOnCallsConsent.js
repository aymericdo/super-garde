/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3892242282",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalker",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "9hv7ybjp8kp7lvv",
    "hidden": false,
    "id": "relation2882370939",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalked",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3892242282",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalker",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "9hv7ybjp8kp7lvv",
    "hidden": false,
    "id": "relation2882370939",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalked",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
