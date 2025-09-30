/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update collection data
  unmarshal({
    "name": "stalkOnCallsConsent"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1140889662")

  // update collection data
  unmarshal({
    "name": "seeOnCallsStudentConsent"
  }, collection)

  return app.save(collection)
})
