/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // remove field
  collection.fields.removeById("relation3363059152")

  return app.save(collection)
})
