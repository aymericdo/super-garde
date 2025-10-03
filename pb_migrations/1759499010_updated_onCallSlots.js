/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3705787676",
    "max": 0,
    "min": 0,
    "name": "otherHospital",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "hp3mbepd",
    "maxSelect": 1,
    "name": "hospital",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Trousseau",
      "Bretonneau",
      "Clocheville",
      "Autre"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove field
  collection.fields.removeById("text3705787676")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "hp3mbepd",
    "maxSelect": 1,
    "name": "hospital",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Trousseau",
      "Bretonneau",
      "Clocheville"
    ]
  }))

  return app.save(collection)
})
