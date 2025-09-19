/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "id": "amds7pecgcmyimm",
    "created": "2023-11-20 20:42:04.908Z",
    "updated": "2023-11-20 20:42:04.908Z",
    "name": "onCallSlots",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "0ooluidw",
        "name": "startTime",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "8cgbhbkd",
        "name": "endTime",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "system": false,
        "id": "cojcdxsn",
        "name": "studentId",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "9hv7ybjp8kp7lvv",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "k3hzfjw8",
        "name": "sector",
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
        "id": "qi29u2xw",
        "name": "hospital",
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

  return app.saveCollection(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("amds7pecgcmyimm");

  return app.deleteCollection(collection);
})
