import { openPhotoDraftDatabase } from './openPhotoDraftDatabase'
import { photoDraftDatabase } from './photoDraftDatabase'

export async function clearPhotoDraft(): Promise<void> {
  const database = await openPhotoDraftDatabase()
  return new Promise((resolve, reject) => {
    const deleteTransaction = database.transaction(photoDraftDatabase.storeName, 'readwrite')
    deleteTransaction.objectStore(photoDraftDatabase.storeName).delete(photoDraftDatabase.mealKey)
    deleteTransaction.oncomplete = () => resolve()
    deleteTransaction.onerror = () => reject(deleteTransaction.error)
  })
}
