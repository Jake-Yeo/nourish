import type { PhotoDraft } from './PhotoDraft'
import { openPhotoDraftDatabase } from './openPhotoDraftDatabase'
import { photoDraftDatabase } from './photoDraftDatabase'

export async function loadPhotoDraft(): Promise<PhotoDraft | null> {
  const database = await openPhotoDraftDatabase()
  return new Promise((resolve, reject) => {
    const draftRequest = database.transaction(photoDraftDatabase.storeName, 'readonly').objectStore(photoDraftDatabase.storeName).get(photoDraftDatabase.mealKey)
    draftRequest.onsuccess = () => resolve(draftRequest.result || null)
    draftRequest.onerror = () => reject(draftRequest.error)
  })
}
