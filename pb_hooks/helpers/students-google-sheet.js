module.exports = {
  fetch: (googleSheetUrl, options) => {
    const { c, $http } = options;

    try {
      if (!config.GOOGLE_SHEET_ID) {
        throw 'no GOOGLE_SHEET_ID in the config';
      }

      // eslint-disable-next-line
      const config = require(`${__hooks}/config.json`)
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
      console.log(headers);
  
      return lines;
    } catch (error) {
      console.log("request failed", error);
      return c.json(403, { "importation-status": 'NOP' });
    }
  },
};
