/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number254049703",
    "max": null,
    "min": null,
    "name": "onCallCount2025",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1014898559",
    "max": null,
    "min": null,
    "name": "totalOnCallCount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  // remove field
  collection.fields.removeById("number254049703")

  // remove field
  collection.fields.removeById("number1014898559")

  return app.save(collection)
})
