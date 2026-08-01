import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ChevronLeft, ImagePlus, LoaderCircle, Sparkles, Trash2, X } from 'lucide-react'
import { emptyNutrients, mealTypes, type Food, type MealType, type Nutrients } from './types'
import { clearPhotoDraft, loadPhotoDraft, savePhotoDraft } from './photoDraft'
import { ModalHandle } from './ModalHandle'

type CapturedPhoto = { id: string; dataUrl: string; note: string }
type EstimateItem = { name: string; portion: string; nutrients: Nutrients }
type Estimate = { mealName: string; confidence: 'low' | 'medium' | 'high'; summary: string; assumptions: string[]; items: EstimateItem[]; totals: Nutrients }
type Step = 'capture' | 'analyzing' | 'review'

const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const image = new Image()
  const url = URL.createObjectURL(file)
  image.onload = () => {
    const max = 1600
    const scale = Math.min(1, max / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale)
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    resolve(canvas.toDataURL('image/jpeg', .78))
  }
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that photo.')) }
  image.src = url
})

export function PhotoMealModal({ defaultMeal, onClose, onLog }: { defaultMeal: MealType; onClose: () => void; onLog: (foods: Food[], meal: MealType) => void }) {
  const [step, setStep] = useState<Step>('capture')
  const [meal, setMeal] = useState(defaultMeal)
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [mealNote, setMealNote] = useState('')
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPhotoDraft().then(draft => {
      if (draft?.photos?.length) { setPhotos(draft.photos); setMealNote(draft.mealNote || ''); setMeal((draft.meal as MealType) || defaultMeal) }
    }).catch(() => undefined)
  }, [defaultMeal])
  useEffect(() => {
    if (step === 'capture') savePhotoDraft({ photos, mealNote, meal }).catch(() => undefined)
  }, [photos, mealNote, meal, step])

  const addFiles = async (files: FileList | null) => {
    if (!files) return
    setError('')
    try {
      const available = Math.max(0, 6 - photos.length)
      const next = await Promise.all(Array.from(files).slice(0, available).map(async file => ({ id: crypto.randomUUID(), dataUrl: await compressImage(file), note: '' })))
      setPhotos(current => [...current, ...next])
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not add photo.') }
  }
  const analyze = async () => {
    if (!photos.length) return setError('Add at least one photo of your meal.')
    setStep('analyzing'); setError('')
    try {
      const response = await fetch('/api/analyze-meal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photos, note: mealNote }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Analysis failed.')
      setEstimate(payload); setStep('review')
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed.'); setStep('capture') }
  }
  const updateItem = (index: number, field: 'name' | 'portion', value: string) => {
    if (!estimate) return
    const items = estimate.items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item)
    setEstimate({ ...estimate, items })
  }
  const updateNutrient = (index: number, key: keyof Nutrients, value: number) => {
    if (!estimate) return
    const items = estimate.items.map((item, itemIndex) => itemIndex === index ? { ...item, nutrients: { ...item.nutrients, [key]: value } } : item)
    const totals = items.reduce((sum, item) => { for (const nutrient of Object.keys(sum) as Array<keyof Nutrients>) sum[nutrient] += item.nutrients[nutrient]; return sum }, emptyNutrients())
    setEstimate({ ...estimate, items, totals })
  }
  const commit = () => {
    if (!estimate) return
    const foods = estimate.items.map((item): Food => ({ id: `photo-${crypto.randomUUID()}`, name: item.name, brand: `AI estimate · ${estimate.confidence} confidence`, servingLabel: item.portion, servingGrams: 0, nutrients: item.nutrients, source: 'custom' }))
    clearPhotoDraft().catch(() => undefined); onLog(foods, meal)
  }

  return <div className="modal-backdrop photo-modal-backdrop"><div className="modal-sheet photo-modal">
    <ModalHandle onClose={onClose} />
    <header className="modal-header">
      <div>{step === 'review' && <button className="back-button" onClick={() => setStep('capture')}><ChevronLeft /></button>}<span className="eyebrow">AI meal estimate</span><h2>{step === 'review' ? estimate?.mealName : step === 'analyzing' ? 'Analyzing your meal' : 'Photograph your meal'}</h2></div>
      <button onClick={onClose}><X /></button>
    </header>

    {step === 'capture' && <div className="capture-flow">
      <div className="meal-choice">{mealTypes.map(item => <button key={item} className={meal === item ? 'active' : ''} onClick={() => setMeal(item)}>{item}</button>)}</div>
      {!photos.length ? <button className="capture-hero" onClick={() => inputRef.current?.click()}><span><Camera /></span><strong>Take meal photos</strong><small>Add up to 6 angles or separate dishes</small></button> : <div className="photo-grid">{photos.map((photo, index) => <div className="photo-card" key={photo.id}>
        <img src={photo.dataUrl} alt={`Meal ${index + 1}`} />
        <button className="photo-delete" onClick={() => setPhotos(current => current.filter(item => item.id !== photo.id))}><Trash2 /></button>
        <label><span>Photo {index + 1} notes</span><textarea value={photo.note} onChange={event => setPhotos(current => current.map(item => item.id === photo.id ? { ...item, note: event.target.value } : item))} placeholder="e.g. 8 oz ribeye, ate about ¾; butter sauce" /></label>
      </div>)}{photos.length < 6 && <button className="add-photo-card" onClick={() => inputRef.current?.click()}><ImagePlus /><span>Add another angle</span></button>}</div>}
      <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" multiple onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
      <label className="meal-note"><span>Overall meal notes <small>optional</small></span><textarea value={mealNote} onChange={event => setMealNote(event.target.value)} placeholder="Anything the photos don't show—restaurant, shared plates, cooking oil, what you left behind…" /></label>
      <div className="estimate-disclaimer"><Sparkles /><p><strong>Photos provide estimates, not measurements.</strong> Notes about portions and hidden ingredients make the result much better.</p></div>
      {error && <p className="error-message">{error}</p>}
      <button className="primary-button analyze-button" disabled={!photos.length} onClick={analyze}><Sparkles /> Analyze {photos.length || ''} photo{photos.length === 1 ? '' : 's'}</button>
    </div>}

    {step === 'analyzing' && <div className="analysis-loading"><div><LoaderCircle /><Sparkles /></div><h3>Estimating portions and macros</h3><p>Comparing all angles and reading your notes. This usually takes a moment.</p></div>}

    {step === 'review' && estimate && <div className="review-flow">
      <div className="estimate-summary"><div><span className={`confidence confidence--${estimate.confidence}`}>{estimate.confidence} confidence</span><p>{estimate.summary}</p></div><div className="total-calories"><strong>{Math.round(estimate.totals.calories)}</strong><span>estimated cal</span></div></div>
      <div className="estimate-macros">{(['protein', 'carbs', 'fat', 'fiber'] as const).map(key => <div key={key}><strong>{Math.round(estimate.totals[key])}g</strong><span>{key}</span></div>)}</div>
      <div className="review-heading"><div><span className="eyebrow">Detected foods</span><h3>Review before logging</h3></div><span>{estimate.items.length} item{estimate.items.length === 1 ? '' : 's'}</span></div>
      <div className="estimate-items">{estimate.items.map((item, index) => <section key={index} className="estimate-item">
        <div className="estimate-item__number">{index + 1}</div><div className="estimate-item__fields"><input value={item.name} onChange={event => updateItem(index, 'name', event.target.value)} /><input className="portion-input" value={item.portion} onChange={event => updateItem(index, 'portion', event.target.value)} /></div>
        <div className="editable-macros">{(['calories', 'protein', 'carbs', 'fat', 'fiber'] as const).map(key => <label key={key}><span>{key === 'calories' ? 'Cal' : key[0].toUpperCase()}</span><input type="number" min="0" value={Math.round(item.nutrients[key])} onChange={event => updateNutrient(index, key, Number(event.target.value))} /></label>)}</div>
      </section>)}</div>
      {estimate.assumptions.length > 0 && <details className="assumptions"><summary>Assumptions behind this estimate</summary><ul>{estimate.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
      <button className="primary-button" onClick={commit}><Check /> Log estimated meal</button>
    </div>}
  </div></div>
}
