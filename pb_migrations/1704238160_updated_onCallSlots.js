/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id || isOnMarket = false))"
  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id || isOnMarket = false))"

  return app.save(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.listRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student = '' || isOnMarket = true || student.user = @request.auth.id))"
  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id))"

  return app.save(collection)
})
