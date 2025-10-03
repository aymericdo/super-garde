/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool302269203",
    "name": "manualSaved",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove field
  collection.fields.removeById("bool302269203")

  return app.save(collection)
})
