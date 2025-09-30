/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // add field
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
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // remove field
  collection.fields.removeById("relation2882370939")

  return app.save(collection)
})
