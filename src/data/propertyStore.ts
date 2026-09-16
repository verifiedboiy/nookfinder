'use client';

import { Property } from '@/types/property';

const STORAGE_KEY = 'nookfinder_inventory_v3';
const DELETED_KEY = 'nookfinder_deleted_ids_v2';
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
// Tombstone Tracking (Prevents resurrecting deleted items while protecting user posts)
// ---------------------------------------------------------------------------
function getDeletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markAsDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getDeletedIds();
    ids.add(id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(ids)));
  } catch {}
}

function unmarkAsDeleted(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const ids = getDeletedIds();
    if (ids.has(id)) {
      ids.delete(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(ids)));
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// IndexedDB Layer (Persistent local client vault)
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

  const deletedIds = getDeletedIds();
  const normalized = updated
    .filter((p) => !deletedIds.has(p.id))
    .map(normalizeProperty);

  memoryCache = normalized;

  // 1. Safe localStorage write
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (storageErr) {
    console.warn('localStorage quota exceeded; fallback to IndexedDB:', storageErr);
  }

  // 2. Persistent IndexedDB write
  saveAllToIDB(normalized).catch(() => {});

  // 3. Trigger events for reactive UI across components and tabs
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
// Smart Server Synchronization & Auto-Reseed (Option 1)
// ---------------------------------------------------------------------------
export async function syncWithServer(): Promise<Property[]> {
  if (typeof window === 'undefined' || isSyncing) {
    return getStoredProperties();
  }

  try {
    isSyncing = true;
    const deletedIds = getDeletedIds();

    // 1. Retrieve local vault listings from IndexedDB & localStorage
    const localIdbProps = await getAllFromIDB();
    let localVault: Property[] = localIdbProps.length > 0 ? localIdbProps : (memoryCache || []);
    if (localVault.length === 0) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) localVault = JSON.parse(raw);
      } catch {}
    }
    const validLocalVault = (localVault || []).filter((p) => p && p.id && !deletedIds.has(p.id));

    // 2. Fetch server listings
    const res = await fetch('/api/properties', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        const serverProps: Property[] = data.properties
          .filter((p: Property) => p && p.id && !deletedIds.has(p.id))
          .map(normalizeProperty);

        // Map server properties by ID
        const serverMap = new Map(serverProps.map((p) => [p.id, p]));

        // Check if any local properties are missing from the server (e.g. fresh Render deploy)
        const missingOnServer = validLocalVault.filter((p) => !serverMap.has(p.id));

        if (missingOnServer.length > 0) {
          // Auto-reseed missing properties to the new server container in background
          fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: missingOnServer }),
          }).catch((err) => console.warn('Auto-reseed sync non-blocking error:', err));

          // Combine server + local listings so no user listings ever disappear
          const mergedList = [...serverProps, ...missingOnServer];
          notifyStoreUpdate(mergedList);
          return mergedList;
        } else {
          // Server has all listings or is up to date
          notifyStoreUpdate(serverProps);
          return serverProps;
        }
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
// Synchronous Retrieval (Instant render for UI components)
// ---------------------------------------------------------------------------
export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const deletedIds = getDeletedIds();

  // Return memory cache if available
  if (memoryCache !== null) {
    return memoryCache.filter((p) => !deletedIds.has(p.id));
  }

  // Read localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter((p: Property) => p && p.id && !deletedIds.has(p.id));
        memoryCache = valid.map(normalizeProperty);
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
      const valid = idbProps.filter((p) => p && p.id && !deletedIds.has(p.id));
      if (valid.length > 0 && (!memoryCache || memoryCache.length === 0)) {
        memoryCache = valid.map(normalizeProperty);
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
  unmarkAsDeleted(property.id);
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
          const deletedIds = getDeletedIds();
          const serverList = data.properties
            .filter((p: Property) => p && p.id && !deletedIds.has(p.id))
            .map(normalizeProperty);
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
  unmarkAsDeleted(property.id);
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
  markAsDeleted(id);
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
          const deletedIds = getDeletedIds();
          const serverList = data.properties
            .filter((p: Property) => p && p.id && !deletedIds.has(p.id))
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
  markAsDeleted(id);
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
