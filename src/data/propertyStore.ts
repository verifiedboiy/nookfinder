'use client';

import { Property } from '@/types/property';

const STORAGE_KEY = 'nookfinder_inventory_v3';
const IDB_NAME = 'NookfinderDB';
const IDB_STORE = 'properties';
const OFFICIAL_EMAIL = 'nookkfinder@gmail.com';
const OFFICIAL_TELEGRAM = 'https://t.me/nook_finder';

let memoryCache: Property[] | null = null;
let isSyncing = false;

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
// IndexedDB Layer (Gigabyte storage, indestructible on refresh)
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
// Unified Broadcast & Cache Write
// ---------------------------------------------------------------------------
function notifyStoreUpdate(updated: Property[]) {
  if (typeof window === 'undefined') return;

  const normalized = updated.map(normalizeProperty);
  memoryCache = normalized;

  // 1. Safe localStorage write
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (storageErr) {
    console.warn('localStorage quota exceeded; fallback to IndexedDB:', storageErr);
  }

  // 2. Persistent IndexedDB write
  saveAllToIDB(normalized).catch(() => {});

  // 3. Trigger events for reactive UI in all tabs
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
// 2-Way Smart Server Synchronization
// ---------------------------------------------------------------------------
export async function syncWithServer(): Promise<Property[]> {
  if (typeof window === 'undefined' || isSyncing) {
    return getStoredProperties();
  }

  try {
    isSyncing = true;

    // Load current local cache (memory / localStorage / IndexedDB)
    let localProps = getStoredProperties();
    if (localProps.length === 0) {
      const idbProps = await getAllFromIDB();
      if (idbProps.length > 0) {
        localProps = idbProps.map(normalizeProperty);
        memoryCache = localProps;
      }
    }

    const res = await fetch('/api/properties', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        const serverProps: Property[] = data.properties.map(normalizeProperty);

        // Merge server and local listings by ID (local unpublished listings are preserved and synced up)
        const mergedMap = new Map<string, Property>();

        // Add server properties
        serverProps.forEach((p) => mergedMap.set(p.id, p));

        // Keep any local properties and push missing ones to server
        const missingOnServer: Property[] = [];
        localProps.forEach((p) => {
          if (!mergedMap.has(p.id)) {
            mergedMap.set(p.id, p);
            missingOnServer.push(p);
          }
        });

        // Upload any local listings to server that were missing on server
        if (missingOnServer.length > 0) {
          for (const item of missingOnServer) {
            fetch('/api/properties', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ property: item }),
            }).catch(() => {});
          }
        }

        const merged = Array.from(mergedMap.values());
        notifyStoreUpdate(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Server sync skipped (network offline):', err);
  } finally {
    isSyncing = false;
  }

  return getStoredProperties();
}

// ---------------------------------------------------------------------------
// Synchronous Retrieval (Instant render for components)
// ---------------------------------------------------------------------------
export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return [];
  }

  // Return memory cache if available
  if (memoryCache !== null) {
    return memoryCache;
  }

  // Read localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed.map(normalizeProperty);
        // Background sync
        if (!isSyncing) {
          setTimeout(syncWithServer, 50);
        }
        return memoryCache;
      }
    }
  } catch (e) {}

  // Check IndexedDB asynchronously if memoryCache and localStorage are empty
  if (!isSyncing) {
    getAllFromIDB().then((idbProps) => {
      if (idbProps.length > 0 && (!memoryCache || memoryCache.length === 0)) {
        memoryCache = idbProps.map(normalizeProperty);
        window.dispatchEvent(new Event('nookfinder_storage_updated'));
      }
      syncWithServer();
    });
  }

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
          const serverList = data.properties.map(normalizeProperty);
          notifyStoreUpdate(serverList);
          return serverList;
        }
      }
    } catch (err) {
      console.warn('Server push non-blocking error:', err);
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
