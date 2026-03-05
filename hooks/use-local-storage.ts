'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state with initialValue to ensure server and client match on first render
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          setStoredValue(JSON.parse(item));
        } catch (parseError) {
          console.warn(`Error parsing localStorage key "${key}", resetting to initialValue:`, parseError);
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          setStoredValue(initialValue);
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    // We intentionally exclude initialValue from dependencies to prevent infinite loops
    // when initialValue is a new object/array on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Sync with localStorage if it was changed in another tab
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}
