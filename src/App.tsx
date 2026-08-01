import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Apple, BarChart3, CalendarDays, Camera, ChevronLeft, ChevronRight, CircleUserRound,
  Droplets, Home, Minus, Plus, ScanLine, Search, Sparkles, Target,
  Trash2, X,
} from 'lucide-react'
import './App.css'
import { starterFoods } from './data'
import { PhotoMealModal } from './PhotoMealModal'
import { lookupBarcode } from './openFoodFacts'
import { loadData, saveData } from './storage'
import {
  emptyNutrients, mealTypes, type AppData, type DiaryEntry, type Food, type Goals,
  type MealType, type Nutrients,
} from './types'

type View = 'today' | 'diary' | 'insights' | 'goals'
type AddMode = 'search' | 'scan' | 'custom'
const nutrientMeta: Array<{ key: keyof Nutrients; label: string; unit: string; color: string }> = [
  { key: 'protein', label: 'Protein', unit: 'g', color: '#7856d8' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#e39b37' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#e66b72' },
  { key: 'fiber', label: 'Fiber', unit: 'g', color: '#269a6d' },
]
const extraNutrients: Array<{ key: keyof Nutrients; label: string; unit: string }> = [
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'saturatedFat', label: 'Saturated fat', unit: 'g' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
]

const todayKey = () => new Date().toISOString().slice(0, 10)
const dateKey = (date: Date) => date.toISOString().slice(0, 10)
const friendlyDate = (key: string) => {
  if (key === todayKey()) return 'Today'
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  if (key === dateKey(yesterday)) return 'Yesterday'
  if (key === dateKey(tomorrow)) return 'Tomorrow'
  return new Date(`${key}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
const shiftDate = (key: string, amount: number) => {
  const value = new Date(`${key}T12:00:00`); value.setDate(value.getDate() + amount); return dateKey(value)
}
const round = (value: number, digits = 0) => Number(value.toFixed(digits))
const scaleNutrients = (food: Food, servings: number) => Object.fromEntries(
  Object.entries(food.nutrients).map(([key, value]) => [key, value * servings]),
) as Nutrients
const totalNutrients = (entries: DiaryEntry[]) => entries.reduce((sum, entry) => {
  const scaled = scaleNutrients(entry.food, entry.servings)
  for (const key of Object.keys(sum) as Array<keyof Nutrients>) sum[key] += scaled[key]
  return sum
}, emptyNutrients())

function ProgressRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(value / Math.max(goal, 1), 1)
  return <div className="calorie-ring" style={{ '--progress': `${pct * 360}deg` } as React.CSSProperties}>
    <div className="calorie-ring__inner">
      <strong>{Math.max(0, Math.round(goal - value)).toLocaleString()}</strong>
      <span>cal left</span>
    </div>
  </div>
}

function NutrientBar({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = Math.min(value / Math.max(goal, 1) * 100, 100)
  return <div className="nutrient-bar">
    <div className="nutrient-bar__label"><span>{label}</span><span><b>{round(value, 1)}</b> / {goal}{unit}</span></div>
    <div className="track"><span style={{ width: `${pct}%`, background: color }} /></div>
  </div>
}

function DatePicker({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  return <div className="date-picker">
    <button onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous day"><ChevronLeft /></button>
    <button className="date-picker__current" onClick={() => onChange(todayKey())}>
      <CalendarDays size={17} /><span>{friendlyDate(date)}</span>
    </button>
    <button onClick={() => onChange(shiftDate(date, 1))} aria-label="Next day"><ChevronRight /></button>
  </div>
}

function Dashboard({ entries, goals, water, onWater, onPhoto, onManual, onViewDiary }: {
  entries: DiaryEntry[]; goals: Goals; water: number; onWater: (n: number) => void;
  onPhoto: () => void; onManual: (meal?: MealType) => void; onViewDiary: () => void
}) {
  const totals = totalNutrients(entries)
  const loggedMeals = new Set(entries.map(entry => entry.meal)).size
  const caloriePct = Math.round(totals.calories / goals.calories * 100)
  return <>
    <section className="hero-card">
      <div className="hero-card__intro">
        <span className="status-pill"><Sparkles size={14} /> Daily plan</span>
        <h2>{entries.length ? `${caloriePct}% of your calorie goal` : 'Ready when you are'}</h2>
        <p>{entries.length ? `${loggedMeals} meal${loggedMeals === 1 ? '' : 's'} logged today` : 'Log your first meal to start the day.'}</p>
      </div>
      <ProgressRing value={totals.calories} goal={goals.calories} />
      <div className="calorie-equation">
        <div><strong>{Math.round(totals.calories).toLocaleString()}</strong><span>Food</span></div>
        <span className="operator">of</span>
        <div><strong>{goals.calories.toLocaleString()}</strong><span>Daily goal</span></div>
      </div>
      <button className="primary-button photo-primary" onClick={onPhoto}><Camera size={19} /> Photograph meal</button>
      <button className="manual-link" onClick={() => onManual()}>Add a correction manually</button>
    </section>

    <section className="section-card">
      <div className="section-heading"><div><span className="eyebrow">Nutrition</span><h3>Your macros</h3></div><button className="text-button" onClick={onViewDiary}>Details</button></div>
      <div className="macro-grid">{nutrientMeta.map(item => <NutrientBar key={item.key} label={item.label} unit={item.unit} color={item.color} value={totals[item.key]} goal={goals[item.key]} />)}</div>
    </section>

    <section className="section-card water-card">
      <div className="water-icon"><Droplets /></div>
      <div className="water-copy"><span className="eyebrow">Hydration</span><h3>{water} of {goals.water} cups</h3><div className="track"><span style={{ width: `${Math.min(water / goals.water * 100, 100)}%` }} /></div></div>
      <div className="stepper compact"><button onClick={() => onWater(Math.max(0, water - 1))}><Minus /></button><button onClick={() => onWater(water + 1)}><Plus /></button></div>
    </section>

    <section className="section-card meals-preview">
      <div className="section-heading"><div><span className="eyebrow">Diary</span><h3>Meals</h3></div><button className="text-button" onClick={onViewDiary}>View all</button></div>
      {mealTypes.map(meal => {
        const mealEntries = entries.filter(entry => entry.meal === meal)
        const cals = totalNutrients(mealEntries).calories
        return <button className="meal-row" key={meal} onClick={() => onManual(meal)}>
          <span className={`meal-icon meal-icon--${meal.toLowerCase()}`}><Apple size={18} /></span>
          <span className="meal-row__copy"><strong>{meal}</strong><small>{mealEntries.length ? `${mealEntries.length} item${mealEntries.length === 1 ? '' : 's'}` : 'Nothing logged'}</small></span>
          <span className="meal-row__calories">{Math.round(cals)} cal</span><Plus size={18} />
        </button>
      })}
    </section>
  </>
}

function Diary({ entries, onAdd, onDelete }: { entries: DiaryEntry[]; onAdd: (meal: MealType) => void; onDelete: (id: string) => void }) {
  return <div className="diary-list">{mealTypes.map(meal => {
    const items = entries.filter(entry => entry.meal === meal)
    const totals = totalNutrients(items)
    return <section className="meal-card" key={meal}>
      <div className="meal-card__header"><div><h3>{meal}</h3><span>{Math.round(totals.calories)} cal · {round(totals.protein, 1)}g protein</span></div><button onClick={() => onAdd(meal)}><Plus /></button></div>
      {items.length === 0 ? <button className="empty-meal" onClick={() => onAdd(meal)}>Add {meal.toLowerCase()}</button> : items.map(entry => {
        const n = scaleNutrients(entry.food, entry.servings)
        return <div className="food-entry" key={entry.id}>
          <div className="food-thumb">{entry.food.image ? <img src={entry.food.image} alt="" /> : <Apple size={20} />}</div>
          <div className="food-entry__copy"><strong>{entry.food.name}</strong><span>{round(entry.servings, 2)} × {entry.food.servingLabel}</span></div>
          <div className="food-entry__nutrition"><strong>{Math.round(n.calories)}</strong><span>cal</span></div>
          <button className="icon-button danger" onClick={() => onDelete(entry.id)} aria-label={`Delete ${entry.food.name}`}><Trash2 /></button>
        </div>
      })}
    </section>
  })}</div>
}

function Insights({ data, date }: { data: AppData; date: string }) {
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(date, index - 6))
  const daily = days.map(day => ({ day, totals: totalNutrients(data.entries.filter(entry => entry.date === day)) }))
  const current = daily.at(-1)?.totals || emptyNutrients()
  const averageCalories = daily.reduce((sum, item) => sum + item.totals.calories, 0) / 7
  return <>
    <section className="insight-hero">
      <span className="eyebrow">Seven-day view</span><h2>Your nutrition trend</h2>
      <div className="chart">
        {daily.map(item => <div className="chart__column" key={item.day}>
          <span style={{ height: `${Math.max(4, Math.min(item.totals.calories / data.goals.calories * 100, 100))}%` }} />
          <small>{new Date(`${item.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' })}</small>
        </div>)}
      </div>
      <p><strong>{Math.round(averageCalories).toLocaleString()}</strong> average calories per day</p>
    </section>
    <section className="section-card">
      <div className="section-heading"><div><span className="eyebrow">Today</span><h3>Nutrient report</h3></div></div>
      <div className="report-list">{[...nutrientMeta, ...extraNutrients].map(item => <NutrientBar key={item.key} label={item.label} unit={item.unit} color={'color' in item ? String(item.color) : '#3b8b73'} value={current[item.key]} goal={data.goals[item.key]} />)}</div>
    </section>
    <section className="tip-card"><div><Sparkles /></div><p><strong>{current.fiber >= data.goals.fiber ? 'Fiber goal reached.' : `${round(data.goals.fiber - current.fiber, 1)}g fiber to go.`}</strong><br />Try berries, beans, avocado, or whole grains to close the gap.</p></section>
  </>
}

function GoalsView({ goals, onSave }: { goals: Goals; onSave: (goals: Goals) => void }) {
  const [draft, setDraft] = useState(goals)
  const fields: Array<{ key: keyof Goals; label: string; unit: string; description: string }> = [
    { key: 'calories', label: 'Calories', unit: 'kcal', description: 'Your daily energy budget' },
    { key: 'protein', label: 'Protein', unit: 'g', description: 'Supports muscle and recovery' },
    { key: 'fiber', label: 'Fiber', unit: 'g', description: 'Supports digestion and fullness' },
    { key: 'carbs', label: 'Carbohydrates', unit: 'g', description: 'Your primary energy source' },
    { key: 'fat', label: 'Fat', unit: 'g', description: 'Essential dietary fats' },
    { key: 'water', label: 'Water', unit: 'cups', description: 'Daily hydration target' },
    ...extraNutrients.map(item => ({ ...item, description: `Daily ${item.label.toLowerCase()} target` })),
  ]
  return <>
    <section className="goals-intro"><div className="goals-intro__icon"><Target /></div><div><span className="eyebrow">Personal plan</span><h2>Nutrition goals</h2><p>Set targets that fit how you eat. You can change them anytime.</p></div></section>
    <section className="settings-card">{fields.map(field => <label className="goal-field" key={field.key}>
      <span><strong>{field.label}</strong><small>{field.description}</small></span>
      <span className="number-input"><input type="number" min="0" step={field.key === 'calories' || field.unit === 'mg' ? 1 : .1} value={draft[field.key]} onChange={event => setDraft({ ...draft, [field.key]: Math.max(0, Number(event.target.value)) })} /><em>{field.unit}</em></span>
    </label>)}</section>
    <button className="primary-button sticky-save" onClick={() => onSave(draft)}>Save goals</button>
  </>
}

function Scanner({ onResult, onManual }: { onResult: (code: string) => void; onManual: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState('')
  const [manual, setManual] = useState('')

  useEffect(() => {
    let active = true
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setError('Camera access is not available in this browser.')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        streamRef.current = stream
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
        const Detector = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector
        if (!Detector) return setError('Live barcode detection is not supported here. Enter the barcode below.')
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
        const scan = async () => {
          if (!active || !videoRef.current) return
          try { const codes = await detector.detect(videoRef.current); if (codes[0]?.rawValue) return onResult(codes[0].rawValue) } catch { /* keep scanning */ }
          requestAnimationFrame(scan)
        }
        scan()
      } catch { setError('Camera permission was denied. Enter the barcode below.') }
    }
    start()
    return () => { active = false; streamRef.current?.getTracks().forEach(track => track.stop()) }
  }, [onResult])

  return <div className="scanner">
    <div className="camera-frame"><video ref={videoRef} muted playsInline /><div className="scan-target"><span /><span /><span /><span /></div><ScanLine className="scan-icon" /></div>
    <p>{error || 'Center the product barcode inside the frame.'}</p>
    <div className="manual-barcode"><input inputMode="numeric" placeholder="Enter UPC or EAN" value={manual} onChange={event => setManual(event.target.value.replace(/\D/g, ''))} /><button disabled={manual.length < 6} onClick={() => onManual(manual)}>Look up</button></div>
  </div>
}

function AddFoodModal({ meal, foods, onClose, onLog, onCustom }: {
  meal: MealType; foods: Food[]; onClose: () => void; onLog: (food: Food, servings: number, meal: MealType) => void; onCustom: (food: Food) => void
}) {
  const [mode, setMode] = useState<AddMode>('search')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Food | null>(null)
  const [servings, setServings] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [custom, setCustom] = useState({ name: '', brand: '', servingLabel: '1 serving', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const results = foods.filter(item => `${item.name} ${item.brand || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
  const scan = async (code: string) => {
    setLoading(true); setError('')
    try { setSelected(await lookupBarcode(code)); setServings(1) } catch (err) { setError(err instanceof Error ? err.message : 'Barcode lookup failed.') }
    finally { setLoading(false) }
  }
  const createCustom = () => {
    if (!custom.name.trim() || !custom.calories) return setError('Add a name and calories first.')
    const nutrients = emptyNutrients()
    for (const key of ['calories', 'protein', 'carbs', 'fat', 'fiber'] as const) nutrients[key] = Number(custom[key]) || 0
    const item: Food = { id: `custom-${crypto.randomUUID()}`, name: custom.name.trim(), brand: custom.brand.trim() || undefined, servingLabel: custom.servingLabel.trim() || '1 serving', servingGrams: 100, nutrients, source: 'custom' }
    onCustom(item); setSelected(item)
  }
  return <div className="modal-backdrop" role="presentation">
    <div className="modal-sheet" role="dialog" aria-modal="true" aria-label="Log food">
      <div className="modal-handle" />
      <header className="modal-header"><div><span className="eyebrow">Add to {meal}</span><h2>{selected ? selected.name : 'Log food'}</h2></div><button onClick={onClose}><X /></button></header>
      {selected ? <div className="food-detail">
        <div className="food-detail__hero">{selected.image ? <img src={selected.image} alt="" /> : <div className="food-detail__placeholder"><Apple /></div>}<div><span>{selected.brand || (selected.source === 'custom' ? 'Custom food' : 'Food database')}</span><strong>{selected.servingLabel}</strong>{selected.barcode && <small>Barcode {selected.barcode}</small>}</div></div>
        <div className="serving-picker"><span>Number of servings</span><div className="stepper"><button onClick={() => setServings(Math.max(.25, servings - .25))}><Minus /></button><strong>{round(servings, 2)}</strong><button onClick={() => setServings(servings + .25)}><Plus /></button></div></div>
        <div className="nutrition-preview"><div><strong>{Math.round(selected.nutrients.calories * servings)}</strong><span>Calories</span></div>{nutrientMeta.map(item => <div key={item.key}><strong>{round(selected.nutrients[item.key] * servings, 1)}{item.unit}</strong><span>{item.label}</span></div>)}</div>
        <button className="primary-button" onClick={() => onLog(selected, servings, meal)}><Plus /> Add to {meal}</button>
        <button className="secondary-button" onClick={() => setSelected(null)}>Choose another food</button>
      </div> : <>
        <div className="mode-tabs"><button className={mode === 'search' ? 'active' : ''} onClick={() => setMode('search')}><Search /> Search</button><button className={mode === 'scan' ? 'active' : ''} onClick={() => setMode('scan')}><Camera /> Scan</button><button className={mode === 'custom' ? 'active' : ''} onClick={() => setMode('custom')}><Plus /> Custom</button></div>
        {mode === 'search' && <><div className="search-box"><Search /><input autoFocus placeholder="Search foods" value={query} onChange={event => setQuery(event.target.value)} /></div><div className="food-results">{results.map(item => <button key={item.id} onClick={() => { setSelected(item); setServings(1) }}><span className="food-thumb"><Apple /></span><span><strong>{item.name}</strong><small>{item.brand ? `${item.brand} · ` : ''}{item.servingLabel}</small></span><b>{Math.round(item.nutrients.calories)} cal</b></button>)}</div></>}
        {mode === 'scan' && (loading ? <div className="loading-state"><ScanLine /><h3>Looking up barcode…</h3></div> : <Scanner onResult={scan} onManual={scan} />)}
        {mode === 'custom' && <div className="custom-form"><label>Food name<input value={custom.name} onChange={event => setCustom({ ...custom, name: event.target.value })} placeholder="e.g. Mom's lentil soup" /></label><label>Brand (optional)<input value={custom.brand} onChange={event => setCustom({ ...custom, brand: event.target.value })} /></label><label>Serving<input value={custom.servingLabel} onChange={event => setCustom({ ...custom, servingLabel: event.target.value })} /></label><div className="custom-grid">{(['calories', 'protein', 'carbs', 'fat', 'fiber'] as const).map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)}<input type="number" min="0" value={custom[key]} onChange={event => setCustom({ ...custom, [key]: event.target.value })} /></label>)}</div><button className="primary-button" onClick={createCustom}>Create food</button></div>}
        {error && <p className="error-message">{error}</p>}
      </>}
    </div>
  </div>
}

function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [view, setView] = useState<View>('today')
  const [date, setDate] = useState(todayKey)
  const [addMeal, setAddMeal] = useState<MealType | null>(null)
  const [photoMeal, setPhotoMeal] = useState<MealType | null>(null)
  const [toast, setToast] = useState('')
  const entries = useMemo(() => data.entries.filter(entry => entry.date === date), [data.entries, date])
  const allFoods = useMemo(() => [...data.customFoods, ...starterFoods], [data.customFoods])

  useEffect(() => saveData(data), [data])
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timeout) }, [toast])

  const logFood = (food: Food, servings: number, meal: MealType) => {
    const entry: DiaryEntry = { id: crypto.randomUUID(), date, meal, food, servings, loggedAt: Date.now() }
    setData(current => ({ ...current, entries: [...current.entries, entry], recentFoodIds: [food.id, ...current.recentFoodIds.filter(id => id !== food.id)].slice(0, 12) }))
    setAddMeal(null); setToast(`${food.name} added to ${meal.toLowerCase()}`)
  }
  const openAdd = (meal: MealType = 'Breakfast') => setAddMeal(meal)
  const logPhotoMeal = (foods: Food[], meal: MealType) => {
    const now = Date.now()
    const entries: DiaryEntry[] = foods.map((food, index) => ({ id: crypto.randomUUID(), date, meal, food, servings: 1, loggedAt: now + index }))
    setData(current => ({ ...current, entries: [...current.entries, ...entries] }))
    setPhotoMeal(null); setToast(`Estimated ${meal.toLowerCase()} logged from ${foods.length} item${foods.length === 1 ? '' : 's'}`)
  }
  const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
    { id: 'today', label: 'Today', icon: Home }, { id: 'diary', label: 'Diary', icon: Apple },
    { id: 'insights', label: 'Insights', icon: BarChart3 }, { id: 'goals', label: 'Goals', icon: Target },
  ]
  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <div className="brand"><span><Apple /></span><strong>Nourish</strong></div>
      <nav>{navItems.map(item => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}><item.icon />{item.label}</button>)}</nav>
      <div className="sidebar-profile"><CircleUserRound /><span><strong>Jake</strong><small>Personal diary</small></span></div>
    </aside>
    <main className="app-main">
      <header className="app-header"><div><span className="eyebrow">Nutrition diary</span><h1>{view === 'today' ? 'Good day, Jake' : view[0].toUpperCase() + view.slice(1)}</h1></div><button className="avatar" onClick={() => setView('goals')}>J</button></header>
      {view !== 'goals' && <DatePicker date={date} onChange={setDate} />}
      <div className="content">
        {view === 'today' && <Dashboard entries={entries} goals={data.goals} water={data.waterByDate[date] || 0} onWater={water => setData(current => ({ ...current, waterByDate: { ...current.waterByDate, [date]: water } }))} onPhoto={() => setPhotoMeal('Breakfast')} onManual={openAdd} onViewDiary={() => setView('diary')} />}
        {view === 'diary' && <Diary entries={entries} onAdd={openAdd} onDelete={id => setData(current => ({ ...current, entries: current.entries.filter(entry => entry.id !== id) }))} />}
        {view === 'insights' && <Insights data={data} date={date} />}
        {view === 'goals' && <GoalsView goals={data.goals} onSave={goals => { setData(current => ({ ...current, goals })); setToast('Nutrition goals saved') }} />}
      </div>
    </main>
    <nav className="bottom-nav">{navItems.map(item => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}><item.icon /><span>{item.label}</span></button>)}</nav>
    <button className="fab" onClick={() => setPhotoMeal('Breakfast')} aria-label="Photograph meal"><Camera /></button>
    {addMeal && <AddFoodModal meal={addMeal} foods={allFoods} onClose={() => setAddMeal(null)} onLog={logFood} onCustom={food => setData(current => ({ ...current, customFoods: [food, ...current.customFoods] }))} />}
    {photoMeal && <PhotoMealModal defaultMeal={photoMeal} onClose={() => setPhotoMeal(null)} onLog={logPhotoMeal} />}
    {toast && <div className="toast"><Sparkles />{toast}</div>}
  </div>
}

export default App
