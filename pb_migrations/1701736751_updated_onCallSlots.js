/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start = start && @request.data.end = end && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id)"

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || student.user = @request.auth.id || isOnMarket = true))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start = start && @request.data.end = end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = null || isOnMarket = true) || student.user = @request.auth.id)"

  return app.save(collection)
})
