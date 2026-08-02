import { photoDraftDatabase } from './photoDraftDatabase'

export function openPhotoDraftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const databaseRequest = indexedDB.open(photoDraftDatabase.name, 1)
    databaseRequest.onupgradeneeded = () => databaseRequest.result.createObjectStore(photoDraftDatabase.storeName)
    databaseRequest.onsuccess = () => resolve(databaseRequest.result)
    databaseRequest.onerror = () => reject(databaseRequest.error)
  })
}
