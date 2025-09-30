/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool2392767712",
    "name": "isOnTransfer",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "bool496086873",
    "name": "isOnExchange",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove field
  collection.fields.removeById("bool2392767712")

  // remove field
  collection.fields.removeById("bool496086873")

  return app.save(collection)
})
