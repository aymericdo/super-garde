const SHEET_HEADERS = [
  "firstName",
  "lastName",
  "email",
  "year",
  "UHCD",
  "onCallCount2025",
  "totalOnCallCount"
];

module.exports = {
  fetch: (googleSheetUrl, options) => {
    const { e, $http } = options;

    try {
      const res = $http.send({
        url: googleSheetUrl,
        method: 'GET',
        body: '', // eg. JSON.stringify({"test": 123})
        headers: { "content-type": "application/json" },
        timeout: 120,
      });
      const raw = res.raw;
      const lines = raw.split(/(?:\r\n|\n)+/).filter((el) => el.length !== 0);
      const headers = lines.splice(0, 1)[0].split(",");

      if (headers.some((header, index) => SHEET_HEADERS[index] !== header.slice(1,-1))) {
        throw `Headers not matching. Should respect : ${SHEET_HEADERS.join(', ')} in this order.`;
      }
  
      return lines;
    } catch (error) {
      console.error("REQUEST FAILED", error);
      return e.json(403, { "importation-status": 'NOP', message: error });
    }
  },
};
