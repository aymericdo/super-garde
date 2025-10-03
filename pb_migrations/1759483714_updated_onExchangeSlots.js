/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_910947720")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_UzVZrz2Z5V` ON `onExchangeSlots` (\n  `toSlot`,\n  `state`\n) WHERE state = 'progress';"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_910947720")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
