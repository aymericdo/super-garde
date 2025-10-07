/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "bool4103720211",
    "name": "validated",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "file4227416285",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/svg+xml",
      "image/gif",
      "image/webp",
      "application/pdf"
    ],
    "name": "proof",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // remove field
  collection.fields.removeById("bool4103720211")

  // remove field
  collection.fields.removeById("file4227416285")

  return app.save(collection)
})
