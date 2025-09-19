/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nkvsctg7",
    "name": "year",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "MM1",
        "MM2",
        "MM3"
      ]
    }
  }))

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nkvsctg7",
    "name": "year",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9"
      ]
    }
  }))

  return app.save(collection)
})
