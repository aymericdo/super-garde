/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_910947720")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "amds7pecgcmyimm",
    "hidden": false,
    "id": "relation392912557",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "toSlot",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_910947720")

  // remove field
  collection.fields.removeById("relation392912557")

  return app.save(collection)
})
