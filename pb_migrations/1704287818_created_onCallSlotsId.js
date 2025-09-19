/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "wncbk6rmhyq5uyx",
    "created": "2024-01-03 13:16:58.822Z",
    "updated": "2024-01-03 13:16:58.822Z",
    "name": "onCallSlotsId",
    "type": "view",
    "system": false,
    "schema": [],
    "indexes": [],
    "listRule": "",
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {
      "query": "SELECT id FROM onCallSlots;"
    }
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("wncbk6rmhyq5uyx");

  return app.delete(collection);
})
