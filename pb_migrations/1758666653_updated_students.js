/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "bool954523902",
    "name": "uhcdAuthorized",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // remove field
  collection.fields.removeById("bool954523902")

  return app.save(collection)
})
