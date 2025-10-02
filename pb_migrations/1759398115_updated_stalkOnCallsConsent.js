/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "date617435213",
    "max": "",
    "min": "",
    "name": "expiration",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // remove field
  collection.fields.removeById("date617435213")

  return app.save(collection)
})
