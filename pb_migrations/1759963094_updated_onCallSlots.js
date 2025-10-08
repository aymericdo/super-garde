/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\" || student = '' || isOnMarket = true || student.user = @request.auth.id || (isOnTransfer = true && onTransferSlots_via_slot.to.user = @request.auth.id) || (isOnExchange = true && (onExchangeSlots_via_slot.to.user = @request.auth.id || onExchangeSlots_via_toSlot.to.user = @request.auth.id)))"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id != \"\" && (@request.auth.role = \"god\" || @request.auth.role = \"assistant\" || student = '' || isOnMarket = true || student.user = @request.auth.id || (isOnTransfer = true && onTransferSlots_via_slot.to.user = @request.auth.id) || (isOnExchange = true && (onExchangeSlots_via_slot.to.user = @request.auth.id || onExchangeSlots_via_slot.from.user = @request.auth.id)))"
  }, collection)

  return app.save(collection)
})
