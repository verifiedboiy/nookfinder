'use client';

const SAVED_STORAGE_KEY = 'nookfinder_user_saved_properties_v1';

export function getSavedPropertyIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function isPropertySaved(propertyId: string): boolean {
  if (typeof window === 'undefined' || !propertyId) return false;
  const saved = getSavedPropertyIds();
  return saved.has(propertyId);
}

export function toggleSaveProperty(propertyId: string): boolean {
  if (typeof window === 'undefined' || !propertyId) return false;
  try {
    const saved = getSavedPropertyIds();
    const isNowSaved = !saved.has(propertyId);

    if (isNowSaved) {
      saved.add(propertyId);
    } else {
      saved.delete(propertyId);
    }

    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(Array.from(saved)));

    // Broadcast across components and tabs
    window.dispatchEvent(
      new CustomEvent('nookfinder_saved_homes_updated', {
        detail: { propertyId, isSaved: isNowSaved },
      })
    );

    return isNowSaved;
  } catch (err) {
    console.error('Error toggling saved property:', err);
    return false;
  }
}
