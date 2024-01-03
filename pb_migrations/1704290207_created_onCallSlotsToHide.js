/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "44mk8b2wdsxwsrl",
    "created": "2024-01-03 13:56:47.591Z",
    "updated": "2024-01-03 13:56:47.591Z",
    "name": "onCallSlotsToHide",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "o2nwlgrz",
        "name": "onCallSlotsId",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("44mk8b2wdsxwsrl");

  return dao.deleteCollection(collection);
})
