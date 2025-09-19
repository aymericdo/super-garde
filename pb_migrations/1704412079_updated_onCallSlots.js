/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_WJ2pJeX` ON `onCallSlots` (\n  `start`,\n  `end`,\n  `student`\n)"
  ]

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_WJ2pJeX` ON `onCallSlots` (\n  `start`,\n  `end`,\n  `hospital`,\n  `sector`\n)"
  ]

  return app.saveCollection(collection)
})
