/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3466450803")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select1115867227",
    "maxSelect": 1,
    "name": "hospital",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Trousseau",
      "Bretonneau",
      "Clocheville"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3466450803")

  // remove field
  collection.fields.removeById("select1115867227")

  return app.save(collection)
})
