/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "nizuxmlvx1vnfz4",
    "created": "2024-01-03 13:39:06.858Z",
    "updated": "2024-01-03 13:39:06.858Z",
    "name": "onCallSlotsHistorical",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hawr4scu",
        "name": "onCallSlotId",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ekqtertm",
        "name": "changes",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
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

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("nizuxmlvx1vnfz4");

  return app.delete(collection);
})
