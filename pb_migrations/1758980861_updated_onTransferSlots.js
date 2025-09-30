/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1542800728",
    "maxSelect": 1,
    "name": "state",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "done",
      "cancel",
      "progress"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "select1542800728",
    "maxSelect": 1,
    "name": "field",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "done",
      "cancel",
      "progress"
    ]
  }))

  return app.save(collection)
})
