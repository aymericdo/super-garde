/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" &&\n(@request.auth.role = \"god\" || @request.auth.role = \"assistant\" || student = '' || isOnMarket = true || student.user = @request.auth.id || (onTransferSlots_via_slot.to.user = @request.auth.id && onTransferSlots_via_slot.state = \"progress\") || (onExchangeSlots_via_slot.to.user = @request.auth.id && onExchangeSlots_via_slot.state = \"progress\"))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" &&\n(@request.auth.role = \"god\" || @request.auth.role = \"assistant\" || student = '' || isOnMarket = true || student.user = @request.auth.id || (onTransferSlots_via_slot.to.user = @request.auth.id && onTransferSlots_via_slot.state = \"progress\"))"
  }, collection)

  return app.save(collection)
})
