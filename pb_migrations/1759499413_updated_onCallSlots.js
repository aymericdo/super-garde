/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (@request.auth.role = \"student\" && @request.body.hospital = 'Autre' && @request.body.start < @now && @request.body.end < @now && @request.body.otherHospital:isset = true && @request.body.student:isset = true)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\") || (@request.auth.role = \"student\" && @request.body.hospital = 'Autre' && @request.body.start < @now && @request.body.end < @now && @request.body.otherHospital:isset = true)"
  }, collection)

  return app.save(collection)
})
