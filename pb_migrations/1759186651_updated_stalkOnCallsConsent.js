/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // remove field
  collection.fields.removeById("relation321540667")

  // remove field
  collection.fields.removeById("relation3363059152")

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
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation321540667",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "amds7pecgcmyimm",
    "hidden": false,
    "id": "relation3363059152",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "slots",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "9hv7ybjp8kp7lvv",
    "hidden": false,
    "id": "relation2882370939",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "stalked2",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
