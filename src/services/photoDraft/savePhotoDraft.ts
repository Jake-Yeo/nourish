import type { PhotoDraft } from './PhotoDraft'
import { openPhotoDraftDatabase } from './openPhotoDraftDatabase'
import { photoDraftDatabase } from './photoDraftDatabase'

export async function savePhotoDraft(photoDraft: PhotoDraft): Promise<void> {
  const database = await openPhotoDraftDatabase()
  return new Promise((resolve, reject) => {
    const writeTransaction = database.transaction(photoDraftDatabase.storeName, 'readwrite')
    writeTransaction.objectStore(photoDraftDatabase.storeName).put(photoDraft, photoDraftDatabase.mealKey)
    writeTransaction.oncomplete = () => resolve()
    writeTransaction.onerror = () => reject(writeTransaction.error)
  })
}
