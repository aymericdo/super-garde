// eslint-disable-next-line
/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/api/generate-events", (c) => {
  const info = $apis.requestInfo(c);
  const admin = info.admin;
  const record = info.authRecord;

  if (!admin && !['god', 'admin'].includes(record?.get('role'))) {
    throw new UnauthorizedError('You are not important enough', {})
  }

  return c.json(200, { "generation-status": 'OK' });
});
