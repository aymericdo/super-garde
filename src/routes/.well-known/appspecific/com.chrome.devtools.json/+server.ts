import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  return new Response('{}', {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};