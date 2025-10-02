/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && slot.start > @now && (@request.auth.role = 'assistant' || @request.auth.role = 'god' || from.user.id = @request.auth.id)",
    "updateRule": "@request.auth.id != \"\" && slot.start > @now && (@request.auth.role = 'assistant' || @request.auth.role = 'god' || from.user.id = @request.auth.id  || to.user.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_939587960")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && slot.start < @now && (@request.auth.role = 'assistant' || @request.auth.role = 'god' || from.user.id = @request.auth.id)",
    "updateRule": "@request.auth.id != \"\" && slot.start < @now && (@request.auth.role = 'assistant' || @request.auth.role = 'god' || from.user.id = @request.auth.id  || to.user.id = @request.auth.id)"
  }, collection)

  return app.save(collection)
})
