/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_WJ2pJeX` ON `onCallSlots` (\n  `start`,\n  `end`,\n  `student`\n)"
  ]

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_WJ2pJeX` ON `onCallSlots` (\n  `start`,\n  `end`,\n  `hospital`,\n  `sector`\n)"
  ]

  return dao.saveCollection(collection)
})
