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

  return <div className="fixed inset-0 z-100 flex items-end justify-center bg-[#0c1914]/48 pt-10 backdrop-blur-[4px] min-[960px]:items-center min-[960px]:p-[30px]"><div className="max-h-[92dvh] w-full max-w-[680px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] bg-white px-[19px] pt-[5px] pb-[calc(24px+env(safe-area-inset-bottom))] text-[#192420] shadow-[0_-20px_60px_rgba(10,30,22,0.22)] [-webkit-overflow-scrolling:touch] min-[960px]:max-h-[88dvh] min-[960px]:rounded-[28px]">
    <ModalHandle onClose={onClose} />
    <header className="flex items-center justify-between pb-[15px]">
      <div className="relative">{step === 'review' && <button className="absolute top-[7px] -left-[5px] grid size-[31px] -translate-x-full cursor-pointer place-items-center rounded-[10px] bg-[#f4f7f4]" onClick={() => setStep('capture')}><ChevronLeft className="w-[17px]" /></button>}<span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">AI meal estimate</span><h2 className="mt-[3px] text-[23px] font-bold tracking-[-0.03em]">{step === 'review' ? estimate?.mealName : step === 'analyzing' ? 'Analyzing your meal' : 'Photograph your meal'}</h2></div>
      <button className="grid size-[39px] cursor-pointer place-items-center rounded-full bg-[#f4f7f4]" onClick={onClose}><X className="w-[19px]" /></button>
    </header>

    {step === 'capture' && <div>
      <div className="flex gap-1.5 overflow-x-auto pb-3.5 [scrollbar-width:none]">{mealTypes.map(item => <button key={item} className={`min-w-[85px] flex-1 cursor-pointer rounded-[11px] border px-[11px] py-[9px] text-[11px] font-bold ${meal === item ? 'border-[#23795e] bg-[#e3f2eb] text-[#155b46]' : 'border-[#e3e9e5] bg-white text-[#71807a]'}`} onClick={() => setMeal(item)}>{item}</button>)}</div>
      {!photos.length ? <button className="flex min-h-[250px] w-full cursor-pointer flex-col items-center justify-center gap-[7px] rounded-[22px] border border-dashed border-[#a7c5b8] bg-linear-to-br from-[#eff8f3] to-[#f8fbf9] text-[#23795e]" onClick={() => inputRef.current?.click()}><span className="mb-1.5 grid size-[68px] place-items-center rounded-[22px] bg-[#23795e] text-white shadow-[0_12px_30px_rgba(35,121,94,0.2)]"><Camera className="size-[29px]" /></span><strong className="text-lg text-[#192420]">Take meal photos</strong><small className="text-[#71807a]">Add up to 6 angles or separate dishes</small></button> : <div className="grid gap-[13px]">{photos.map((photo, index) => <div className="relative grid grid-cols-1 gap-3 rounded-[18px] border border-[#e3e9e5] bg-[#f4f7f4] p-2.5 min-[441px]:grid-cols-[132px_1fr]" key={photo.id}>
        <img className="h-[190px] w-full rounded-[13px] object-cover min-[441px]:h-[118px] min-[441px]:w-[132px]" src={photo.dataUrl} alt={`Meal ${index + 1}`} />
        <button className="absolute top-[17px] right-[17px] grid size-7 cursor-pointer place-items-center rounded-[9px] bg-[#111e19]/76 text-white min-[441px]:top-4 min-[441px]:right-auto min-[441px]:left-28" onClick={() => setPhotos(current => current.filter(item => item.id !== photo.id))}><Trash2 className="w-3.5" /></button>
        <label className="flex flex-col gap-1.5"><span className="text-[11px] font-extrabold">Photo {index + 1} notes</span><textarea className="min-h-[84px] w-full resize-y rounded-[11px] border border-[#e3e9e5] bg-white p-2.5 text-base leading-[1.4] text-[#192420] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" value={photo.note} onChange={event => setPhotos(current => current.map(item => item.id === photo.id ? { ...item, note: event.target.value } : item))} placeholder="e.g. 8 oz ribeye, ate about ¾; butter sauce" /></label>
      </div>)}{photos.length < 6 && <button className="flex min-h-[78px] cursor-pointer items-center justify-center gap-[9px] rounded-2xl border border-dashed border-[#aec8bd] bg-[#e3f2eb] text-xs font-extrabold text-[#23795e]" onClick={() => inputRef.current?.click()}><ImagePlus /><span>Add another angle</span></button>}</div>}
      <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" multiple onChange={event => { addFiles(event.target.files); event.target.value = '' }} />
      <label className="mt-4 grid gap-[7px] text-xs font-extrabold"><span>Overall meal notes <small className="font-medium text-[#71807a]">optional</small></span><textarea className="min-h-[74px] w-full resize-y rounded-[11px] border border-[#e3e9e5] bg-white p-2.5 text-base leading-[1.4] text-[#192420] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" value={mealNote} onChange={event => setMealNote(event.target.value)} placeholder="Anything the photos don't show—restaurant, shared plates, cooking oil, what you left behind…" /></label>
      <div className="my-[13px] flex gap-2.5 rounded-[13px] bg-[#fff8e8] p-[13px] text-[#836328]"><Sparkles className="w-[18px] shrink-0" /><p className="text-[11px] leading-[1.45]"><strong>Photos provide estimates, not measurements.</strong> Notes about portions and hidden ingredients make the result much better.</p></div>
      {error && <p className="rounded-[11px] bg-[#fae8e9] px-[13px] py-[11px] text-xs text-[#9b4147]">{error}</p>}
      <button className="flex min-h-[49px] w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-[#23795e] font-extrabold text-white shadow-[0_9px_20px_rgba(35,121,94,0.2)] hover:bg-[#155b46] disabled:cursor-not-allowed disabled:opacity-45" disabled={!photos.length} onClick={analyze}><Sparkles /> Analyze {photos.length || ''} photo{photos.length === 1 ? '' : 's'}</button>
    </div>}

    {step === 'analyzing' && <div className="flex min-h-[430px] flex-col items-center justify-center p-10 text-center"><div className="relative grid size-[86px] place-items-center rounded-[27px] bg-[#e3f2eb] text-[#23795e]"><LoaderCircle className="size-[45px] animate-spin" /><Sparkles className="absolute -right-1 -bottom-1 size-[29px] rounded-full bg-[#23795e] p-1.5 text-white" /></div><h3 className="mt-[22px] mb-1.5 text-[19px] font-bold">Estimating portions and macros</h3><p className="max-w-[340px] text-xs leading-[1.5] text-[#71807a]">Comparing all angles and reading your notes. This usually takes a moment.</p></div>}

    {step === 'review' && estimate && <div>
      <div className="grid grid-cols-[1fr_auto] gap-[15px] rounded-[18px] bg-[#f4f7f4] p-4"><div><span className={`inline-flex rounded-full px-2 py-[5px] text-[9px] font-extrabold tracking-[0.08em] uppercase ${estimate.confidence === 'high' ? 'bg-[#e3f2eb] text-[#23795e]' : estimate.confidence === 'low' ? 'bg-[#fae7e8] text-[#a6464d]' : 'bg-[#fff2d8] text-[#9a671d]'}`}>{estimate.confidence} confidence</span><p className="mt-2 text-xs leading-[1.45] text-[#71807a]">{estimate.summary}</p></div><div className="flex flex-col items-end justify-center"><strong className="text-[28px] tracking-[-0.04em]">{Math.round(estimate.totals.calories)}</strong><span className="text-[10px] text-[#71807a]">estimated cal</span></div></div>
      <div className="my-3 mb-[21px] grid grid-cols-4 overflow-hidden rounded-[14px] border border-[#e3e9e5]">{(['protein', 'carbs', 'fat', 'fiber'] as const).map(key => <div className="flex flex-col items-center border-r border-[#e3e9e5] px-[5px] py-[11px] last:border-r-0" key={key}><strong className="text-sm">{Math.round(estimate.totals[key])}g</strong><span className="text-[9px] text-[#71807a] capitalize">{key}</span></div>)}</div>
      <div className="mb-2.5 flex items-end justify-between"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Detected foods</span><h3 className="mt-[3px] text-lg font-bold">Review before logging</h3></div><span className="text-[11px] text-[#71807a]">{estimate.items.length} item{estimate.items.length === 1 ? '' : 's'}</span></div>
      <div className="grid gap-[9px]">{estimate.items.map((item, index) => <section key={index} className="grid grid-cols-[auto_1fr] gap-[9px] rounded-2xl border border-[#e3e9e5] p-3">
        <div className="grid size-7 place-items-center rounded-[9px] bg-[#e3f2eb] text-[11px] font-extrabold text-[#23795e]">{index + 1}</div><div className="grid grid-cols-1 gap-[7px] min-[441px]:grid-cols-2"><input className="min-w-0 rounded-[9px] border border-[#e3e9e5] px-[9px] py-2 text-base font-bold outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" value={item.name} onChange={event => updateItem(index, 'name', event.target.value)} /><input className="min-w-0 rounded-[9px] border border-[#e3e9e5] px-[9px] py-2 text-base font-medium text-[#71807a] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" value={item.portion} onChange={event => updateItem(index, 'portion', event.target.value)} /></div>
        <div className="col-span-full grid grid-cols-5 gap-[5px]">{(['calories', 'protein', 'carbs', 'fat', 'fiber'] as const).map(key => <label className="grid gap-[3px] text-center text-[9px] text-[#71807a]" key={key}><span>{key === 'calories' ? 'Cal' : key[0].toUpperCase()}</span><input className="w-full min-w-0 rounded-lg border border-[#e3e9e5] px-0.5 py-[7px] text-center text-base font-bold outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" type="number" min="0" value={Math.round(item.nutrients[key])} onChange={event => updateNutrient(index, key, Number(event.target.value))} /></label>)}</div>
      </section>)}</div>
      {estimate.assumptions.length > 0 && <details className="my-[13px] rounded-[13px] bg-[#f7f9f7] px-3.5 py-3 text-[11px] text-[#71807a]"><summary className="cursor-pointer font-bold text-[#192420]">Assumptions behind this estimate</summary><ul className="mt-[9px] list-disc pl-[18px] leading-[1.5]">{estimate.assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
      <button className="flex min-h-[49px] w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-[#23795e] font-extrabold text-white shadow-[0_9px_20px_rgba(35,121,94,0.2)] hover:bg-[#155b46]" onClick={commit}><Check /> Log estimated meal</button>
    </div>}
  </div></div>
}
