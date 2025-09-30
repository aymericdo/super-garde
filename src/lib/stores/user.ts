import { writable } from 'svelte/store';
import type { AuthModel, RecordModel } from 'pocketbase';

export interface UserRecord extends RecordModel {
  role: 'student' | 'assistant' | 'god';
}

export const currentUser = writable<UserRecord | AuthModel | null>()
