/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("wncbk6rmhyq5uyx");

  return dao.deleteCollection(collection);
}, (db) => {
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

  return Dao(db).saveCollection(collection);
})
