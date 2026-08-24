import type { CaptureFoodItem, CapturedPhoto } from './photoMeal'

export type SavedPhotoItem = { id: string; name: string; description: string; photos: CapturedPhoto[]; entryId: string | null }
export type SavedPhotoMeal = { id: string; mealNote: string; items: SavedPhotoItem[]; legacyPhotos?: CapturedPhoto[]; readOnlyLegacy?: boolean }
export type PersistedPhotoItem = CaptureFoodItem & { entryId: string }
export type PhotoStorageUsage = { bytes: number; photoCount: number; mealCount: number }
