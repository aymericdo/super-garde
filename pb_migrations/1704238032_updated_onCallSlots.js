/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true || isOnMarket = false) && @request.data.student.user.id = @request.auth.id))"

  return app.saveCollection(collection)
}, (app) => {
  const dao = new Dao(app)
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  collection.viewRule = "@request.auth.id != \"\" &&\n((@request.auth.role = \"god\" || @request.auth.role = \"assistant\")\n || (student = '' || isOnMarket = true || student.user = @request.auth.id || (isOnMarket = false)))"
  collection.updateRule = "@request.auth.id != \"\" && @request.data.start:isset = false && @request.data.end:isset = false && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (student.user = @request.auth.id || ((student = '' || isOnMarket = true) && @request.data.student.user.id = @request.auth.id))"

  return app.saveCollection(collection)
})
