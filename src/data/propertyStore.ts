'use client';

import { Property } from '@/types/property';

const STORAGE_KEY = 'nookfinder_inventory_v4';
const IDB_NAME = 'NookfinderDB_v4';
const IDB_STORE = 'properties';
const OFFICIAL_EMAIL = 'nookkfinder@gmail.com';
const OFFICIAL_TELEGRAM = 'https://t.me/nook_finder';

let memoryCache: Property[] | null = null;
let activeSyncPromise: Promise<Property[]> | null = null;

function normalizeProperty(p: Property): Property {
  if (!p) return p;
  return {
    ...p,
    agent: p.agent
      ? {
          ...p.agent,
          email: OFFICIAL_EMAIL,
          telegram: OFFICIAL_TELEGRAM,
        }
      : {
          name: 'Marcus Vance',
          title: 'Nookfinder Dedicated Property Specialist',
          phone: '+1 (404) 890-1244',
          email: OFFICIAL_EMAIL,
          telegram: OFFICIAL_TELEGRAM,
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          rating: 4.9,
          reviewCount: 42,
          verifiedLicense: 'NF-STAFF-40918',
          isNookfinderStaff: true,
        },
  };
}

// ---------------------------------------------------------------------------
// IndexedDB Persistence Layer
// ---------------------------------------------------------------------------
function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveAllToIDB(properties: Property[]): Promise<void> {
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      properties.forEach((p) => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getAllFromIDB(): Promise<Property[]> {
  const db = await getDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

// ---------------------------------------------------------------------------
// Unified Broadcast & Local Cache Write
// ---------------------------------------------------------------------------
function notifyStoreUpdate(updated: Property[]) {
  if (typeof window === 'undefined') return;

  const normalized = (updated || []).map(normalizeProperty);
  memoryCache = normalized;

  // 1. Write to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (storageErr) {
    console.warn('localStorage write warning:', storageErr);
  }

  // 2. Write to IndexedDB
  saveAllToIDB(normalized).catch(() => {});

  // 3. Dispatch reactive events
  window.dispatchEvent(new Event('nookfinder_storage_updated'));
  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(normalized),
      })
    );
  } catch (e) {}
}

// ---------------------------------------------------------------------------
// Live Server Synchronization (Zero-Lag, Always Authoritative)
// ---------------------------------------------------------------------------
export async function syncWithServer(forceFresh = false): Promise<Property[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  // Reuse in-flight fetch promise if already syncing
  if (activeSyncPromise && !forceFresh) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      // Timestamp bypasses intermediate CDN and browser disk cache
      const cacheBuster = Date.now();
      const res = await fetch(`/api/properties?_t=${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          const serverProps: Property[] = data.properties
            .filter((p: Property) => p && p.id)
            .map(normalizeProperty);

          notifyStoreUpdate(serverProps);
          return serverProps;
        }
      }
    } catch (err) {
      console.warn('Server sync skipped (offline or network error):', err);
    } finally {
      activeSyncPromise = null;
    }

    return getStoredProperties();
  })();

  return activeSyncPromise;
}

// ---------------------------------------------------------------------------
// Synchronous Retrieval (Instant UI render)
// ---------------------------------------------------------------------------
export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return [];
  }

  // 1. Memory cache
  if (memoryCache !== null && memoryCache.length > 0) {
    return memoryCache;
  }

  // 2. LocalStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed.map(normalizeProperty);
        // Silently trigger background refresh
        setTimeout(() => syncWithServer(), 10);
        return memoryCache;
      }
    }
  } catch (e) {}

  // 3. Fallback to trigger initial sync
  setTimeout(() => syncWithServer(), 10);
  return [];
}

// ---------------------------------------------------------------------------
// Save / Update Listing Handler
// ---------------------------------------------------------------------------
export async function saveStoredPropertyAsync(property: Property): Promise<Property[]> {
  const normalizedProp = normalizeProperty(property);
  const current = getStoredProperties();
  const existingIdx = current.findIndex((p) => p.id === normalizedProp.id);

  let updated: Property[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = normalizedProp;
  } else {
    updated = [normalizedProp, ...current];
  }

  notifyStoreUpdate(updated);

  // Push to server API
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property: normalizedProp }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          const serverList = data.properties
            .filter((p: Property) => p && p.id)
            .map(normalizeProperty);
          notifyStoreUpdate(serverList);
          return serverList;
        }
      }
    } catch (err) {
      console.warn('Server push error:', err);
    }
  }

  return updated;
}

export function saveStoredProperty(property: Property): Property[] {
  const normalizedProp = normalizeProperty(property);
  const current = getStoredProperties();
  const existingIdx = current.findIndex((p) => p.id === normalizedProp.id);

  let updated: Property[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = normalizedProp;
  } else {
    updated = [normalizedProp, ...current];
  }

  notifyStoreUpdate(updated);

  if (typeof window !== 'undefined') {
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: normalizedProp }),
    }).catch((err) => console.error('Error saving property to server:', err));
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Delete Listing Handler
// ---------------------------------------------------------------------------
export async function deleteStoredPropertyAsync(id: string): Promise<Property[]> {
  const current = getStoredProperties();
  const updated = current.filter((p) => p.id !== id);
  notifyStoreUpdate(updated);

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          const serverList = data.properties
            .filter((p: Property) => p && p.id)
            .map(normalizeProperty);
          notifyStoreUpdate(serverList);
          return serverList;
        }
      }
    } catch (err) {
      console.error('Error deleting property on server:', err);
    }
  }

  return updated;
}

export function deleteStoredProperty(id: string): Property[] {
  const current = getStoredProperties();
  const updated = current.filter((p) => p.id !== id);
  notifyStoreUpdate(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting property on server:', err));
  }

  return updated;
}
