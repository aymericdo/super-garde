/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = [
    "CREATE UNIQUE INDEX `idx_xfXFzGw` ON `students` (`email`)"
  ]

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("9hv7ybjp8kp7lvv")

  collection.indexes = []

  return app.save(collection)
})
