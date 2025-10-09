/// <reference path="../pb_data/types.d.ts" />

onModelCreate((e) => {
    const url = e.model?.data?.get('url');
    const method = e.model?.data?.get('method');

    // Ignore les endpoints "health" et "realtime"
    const isHealth = url === "/api/health" && method === "GET";
    const isRealtime = url === "/api/realtime" && method === "POST";

    if (isHealth || isRealtime) {
      return;
    }

    e.next();
}, "_logs")