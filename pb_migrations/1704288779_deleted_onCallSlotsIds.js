/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "id": "wncbk6rmhyq5uyx",
    "created": "2024-01-03 13:16:58.822Z",
    "updated": "2024-01-03 13:21:40.278Z",
    "name": "onCallSlotsIds",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "cafdtozj",
        "name": "isOnMarket",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT id, isOnMarket FROM onCallSlots;"
    }
  });

  return app.save(collection);
})
