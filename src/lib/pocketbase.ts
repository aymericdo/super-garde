import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
import PocketBase from 'pocketbase'

export function createInstance() {
  const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
  pb.autoCancellation(false);
  return pb;
}

export const pb = createInstance()

