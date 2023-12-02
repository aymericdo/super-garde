import type { Admin, Record } from 'pocketbase';
import { writable } from 'svelte/store';

export interface UserRecord extends Record {
  role: 'student' | 'assistant' | 'god';
}

export const currentUser = writable<UserRecord | Admin | null>()
