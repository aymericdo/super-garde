/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool954523902",
    "name": "UHCD",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool954523902",
    "name": "uhcd",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
