/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start = start && @request.data.end = end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = null || isOnMarket = true) || student.user = @request.auth.id)"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.updateRule = "@request.auth.id != \"\" && @request.data.start = start && @request.data.end = end && ((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (((student = '' || isOnMarket = true)) || student.user = @request.auth.id))"

  return app.save(collection)
})
