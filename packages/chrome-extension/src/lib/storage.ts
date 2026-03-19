import type { BuffAuth, BuffSettings, BuffStats } from "../types";
import { DEFAULT_SETTINGS, DEFAULT_STATS } from "../constants";

type StorageSchema = {
  auth: BuffAuth | null;
  settings: BuffSettings;
  stats: BuffStats;
};

const DEFAULTS: StorageSchema = {
  auth: null,
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
};

export async function get<K extends keyof StorageSchema>(
  key: K
): Promise<StorageSchema[K]> {
  const result = await chrome.storage.local.get(key);
  return result[key] ?? DEFAULTS[key];
}

export async function set<K extends keyof StorageSchema>(
  key: K,
  value: StorageSchema[K]
): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function update<K extends keyof StorageSchema>(
  key: K,
  partial: Partial<StorageSchema[K]>
): Promise<StorageSchema[K]> {
  const current = await get(key);
  const updated = { ...current, ...partial } as StorageSchema[K];
  await set(key, updated);
  return updated;
}

export async function clear(): Promise<void> {
  await chrome.storage.local.clear();
}
