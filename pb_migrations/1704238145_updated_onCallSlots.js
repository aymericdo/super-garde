/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true) && @request.data.student.user.id = @request.auth.id))"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true || isOnMarket = false) && @request.data.student.user.id = @request.auth.id))"

  return app.save(collection)
})
