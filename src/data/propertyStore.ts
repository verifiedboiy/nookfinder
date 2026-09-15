'use client';

import { Property } from '@/types/property';
import { MOCK_PROPERTIES } from './mockProperties';

const STORAGE_KEY = 'nookfinder_inventory_v2';
const OFFICIAL_EMAIL = 'nookkfinder@gmail.com';
const OFFICIAL_TELEGRAM = 'https://t.me/nook_finder';

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
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
          rating: 4.9,
          reviewCount: 42,
          verifiedLicense: 'NF-STAFF-40918',
          isNookfinderStaff: true,
        },
  };
}

let isSyncing = false;

// Sync client cache with central server database
export async function syncWithServer(): Promise<Property[]> {
  if (typeof window === 'undefined' || isSyncing) {
    return getStoredProperties();
  }

  try {
    isSyncing = true;
    const res = await fetch('/api/properties', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        const serverProps = data.properties.map(normalizeProperty);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverProps));
        window.dispatchEvent(new Event('nookfinder_storage_updated'));
        return serverProps;
      }
    }
  } catch (err) {
    console.warn('Server sync skipped (offline or network error):', err);
  } finally {
    isSyncing = false;
  }
  return getStoredProperties();
}

export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return MOCK_PROPERTIES.map(normalizeProperty);
  }

  // Trigger background server sync
  if (!isSyncing) {
    setTimeout(() => {
      syncWithServer();
    }, 100);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const normalized = MOCK_PROPERTIES.map(normalizeProperty);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeProperty);
  } catch {
    return MOCK_PROPERTIES.map(normalizeProperty);
  }
}

function notifyStoreUpdate(updated: Property[]) {
  if (typeof window !== 'undefined') {
    const normalized = updated.map(normalizeProperty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new Event('nookfinder_storage_updated'));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEY,
        newValue: JSON.stringify(normalized),
      })
    );
  }
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

  // Asynchronously push update to central server API
  if (typeof window !== 'undefined') {
    fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: normalizedProp }),
    }).catch((err) => console.error('Error saving property to server:', err));
  }

  return updated;
}

export function deleteStoredProperty(id: string): Property[] {
  const current = getStoredProperties();
  const updated = current.filter((p) => p.id !== id);
  notifyStoreUpdate(updated);

  // Asynchronously delete from central server API
  if (typeof window !== 'undefined') {
    fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting property on server:', err));
  }

  return updated;
}

export function resetStoredProperties(): Property[] {
  notifyStoreUpdate(MOCK_PROPERTIES);

  if (typeof window !== 'undefined') {
    fetch('/api/properties?action=reset', {
      method: 'POST',
    }).catch((err) => console.error('Error resetting server properties:', err));
  }

  return MOCK_PROPERTIES;
}

export function clearAllStoredProperties(): Property[] {
  notifyStoreUpdate([]);

  if (typeof window !== 'undefined') {
    fetch('/api/properties?action=clear_all', {
      method: 'DELETE',
    }).catch((err) => console.error('Error clearing server properties:', err));
  }

  return [];
}
