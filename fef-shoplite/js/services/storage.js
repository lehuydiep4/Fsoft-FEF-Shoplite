// js/services/storage.js
// Infrastructure Layer: Handles direct interaction with Web Storage API.

/**
 * Retrieves data from localStorage by key, parsing JSON.
 * Returns the parsed data or fallback if not found or parsing fails.
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function getFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

/**
 * Saves data to localStorage by key, stringifying to JSON.
 * @param {string} key
 * @param {*} data
 */
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}
