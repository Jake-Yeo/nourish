import { useEffect, useMemo, useState } from 'react'
import {
  Apple, BarChart3, CalendarDays, Camera, ChevronLeft, ChevronRight, CircleUserRound,
  Home, KeyRound, Plus, RefreshCw, Sparkles, Target, Trash2, X,
} from 'lucide-react'
import './App.css'
import { PhotoMealModal } from './PhotoMealModal'
import { ModalHandle } from './ModalHandle'
import { bootstrapData, fetchData, loadData, mutateData, type DataMutation } from './storage'
import {
  emptyNutrients, mealTypes, type AppData, type DiaryEntry, type Food, type Goals,
  type MealType, type Nutrients,
} from './types'

type View = 'today' | 'diary' | 'insights' | 'goals'
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

function Dashboard({ entries, goals, onPhoto, onManual, onViewDiary }: {
  entries: DiaryEntry[]; goals: Goals; onPhoto: () => void; onManual: (meal?: MealType) => void; onViewDiary: () => void
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

    <section className="section-card meals-preview">
      <div className="section-heading"><div><span className="eyebrow">Diary</span><h3>Meals</h3></div><button className="text-button" onClick={onViewDiary}>View all</button></div>
      {mealTypes.map(meal => {
        const mealEntries = entries.filter(entry => entry.meal === meal)
        const cals = totalNutrients(mealEntries).calories
        return <div className="meal-row" key={meal}>
          <span className={`meal-icon meal-icon--${meal.toLowerCase()}`}><Apple size={18} /></span>
          <span className="meal-row__copy"><strong>{meal}</strong><small>{mealEntries.length ? `${mealEntries.length} item${mealEntries.length === 1 ? '' : 's'}` : 'Nothing logged'}</small></span>
          <span className="meal-row__calories">{Math.round(cals)} cal</span><button className="icon-button" onClick={() => onManual(meal)} aria-label={`Quick add to ${meal}`}><Plus size={18} /></button>
        </div>
      })}
    </section>
  </>
}

function Diary({ entries, onAdd, onDelete, onSelect }: { entries: DiaryEntry[]; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onSelect: (entry: DiaryEntry) => void }) {
  return <div className="diary-list">{mealTypes.map(meal => {
    const items = entries.filter(entry => entry.meal === meal)
    const totals = totalNutrients(items)
    return <section className="meal-card" key={meal}>
      <div className="meal-card__header"><div><h3>{meal}</h3><span>{Math.round(totals.calories)} cal · {round(totals.protein, 1)}g protein</span></div><button onClick={() => onAdd(meal)}><Plus /></button></div>
      {items.length === 0 ? <button className="empty-meal" onClick={() => onAdd(meal)}>Add {meal.toLowerCase()}</button> : items.map(entry => {
        const n = scaleNutrients(entry.food, entry.servings)
        return <div className="food-entry" key={entry.id} role="button" tabIndex={0} onClick={() => onSelect(entry)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelect(entry) }}>
          <div className="food-thumb">{entry.food.image ? <img src={entry.food.image} alt="" /> : <Apple size={20} />}</div>
          <div className="food-entry__copy"><strong>{entry.food.name}</strong><span>{round(entry.servings, 2)} × {entry.food.servingLabel}</span><small className={`source-badge source-badge--${entry.source || 'nourish-manual'}`}>{entry.source === 'mynetdiary' ? 'MyNetDiary' : entry.source === 'nourish-photo' ? 'AI photo' : entry.source === 'nourish-barcode' ? 'Barcode' : 'Nourish'}</small></div>
          <div className="food-entry__nutrition"><strong>{Math.round(n.calories)}</strong><span>cal</span></div>
          {entry.source !== 'mynetdiary' && <button className="icon-button danger" onClick={event => { event.stopPropagation(); onDelete(entry.id) }} aria-label={`Delete ${entry.food.name}`}><Trash2 /></button>}
        </div>
      })}
    </section>
  })}</div>
}

function Insights({ data, date }: { data: AppData; date: string }) {
  const [range, setRange] = useState(7)
  const days = Array.from({ length: range }, (_, index) => shiftDate(date, index - range + 1))
  const daily = days.map(day => ({ day, totals: totalNutrients(data.entries.filter(entry => entry.date === day)) }))
  const current = daily.at(-1)?.totals || emptyNutrients()
  const adjustedDays = daily.map(item => item.totals.calories < 1000 ? data.goals.maintenanceCalories : item.totals.calories)
  const assumedDays = daily.filter(item => item.totals.calories < 1000).length
  const averageCalories = adjustedDays.reduce((sum, calories) => sum + calories, 0) / range
  return <>
    <section className="insight-hero">
      <div className="insight-heading"><div><span className="eyebrow">{range}-day view</span><h2>Your nutrition trend</h2></div><label>Days<select value={range} onChange={event => setRange(Number(event.target.value))}>{Array.from({ length: 89 }, (_, index) => index + 2).map(days => <option key={days} value={days}>{days}</option>)}</select></label></div>
      <div className="chart">
        {daily.map((item, index) => <div className="chart__column" key={item.day} title={`${friendlyDate(item.day)}: ${Math.round(item.totals.calories)} calories`}>
          <span style={{ height: `${Math.max(4, Math.min(item.totals.calories / data.goals.calories * 100, 100))}%` }} />
          <small>{range <= 14 || index === 0 || index === range - 1 || index % Math.ceil(range / 7) === 0 ? new Date(`${item.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' }) : ''}</small>
        </div>)}
      </div>
      <p><strong>{Math.round(averageCalories).toLocaleString()}</strong> average calories per day</p>
      {assumedDays > 0 && <small className="average-note">Used {data.goals.maintenanceCalories.toLocaleString()} calories for {assumedDays} day{assumedDays === 1 ? '' : 's'} logged below 1,000.</small>}
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
    { key: 'maintenanceCalories', label: 'Calorie maintenance', unit: 'kcal', description: 'Used for insight days logged below 1,000 calories' },
    ...extraNutrients.map(item => ({ ...item, description: `Daily ${item.label.toLowerCase()} target` })),
  ]
  return <>
    <section className="goals-intro"><div className="goals-intro__icon"><Target /></div><div><span className="eyebrow">Personal plan</span><h2>Nutrition goals</h2><p>Set targets that fit how you eat. You can change them anytime.</p></div></section>
    <section className="settings-card">{fields.map(field => <label className="goal-field" key={field.key}>
      <span><strong>{field.label}</strong><small>{field.description}</small></span>
      <span className="number-input"><input type="number" min="0" step={field.key === 'calories' || field.unit === 'mg' ? 1 : .1} value={draft[field.key]} onChange={event => setDraft({ ...draft, [field.key]: Math.max(0, Number(event.target.value)) })} /><em>{field.unit}</em></span>
    </label>)}</section>
    <button className="primary-button sticky-save" onClick={() => onSave(draft)}>Save goals</button>
    <MyNetDiaryAccount />
  </>
}

function MyNetDiaryAccount() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [configured, setConfigured] = useState(false)
  const [emailHint, setEmailHint] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/mynetdiary-credentials').then(response => response.json()).then(payload => {
      setConfigured(Boolean(payload.configured)); setEmailHint(String(payload.emailHint || ''))
    }).catch(() => setMessage('Could not check MyNetDiary login status.'))
  }, [])

  const save = async () => {
    setSaving(true); setMessage('')
    try {
      const response = await fetch('/api/mynetdiary-credentials', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not save MyNetDiary login.')
      setConfigured(true); setEmailHint(payload.emailHint || email); setEmail(''); setPassword('')
      setMessage('Saved securely in this Mac’s Keychain.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save MyNetDiary login.') }
    finally { setSaving(false) }
  }

  return <section className="account-card">
    <div className="account-card__heading"><div><KeyRound /></div><span><strong>MyNetDiary login</strong><small>{configured ? `Configured for ${emailHint}` : 'Required for automatic headless sync'}</small></span></div>
    <p>Nourish stores this login in the Mac’s Keychain and uses it only when MyNetDiary asks the sync browser to sign in.</p>
    <label>Email or account name<input type="text" autoCapitalize="none" autoCorrect="off" value={email} onChange={event => setEmail(event.target.value)} placeholder={configured ? 'Enter to replace saved login' : 'MyNetDiary email'} /></label>
    <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={configured ? 'Enter to replace saved password' : 'MyNetDiary password'} /></label>
    <button className="secondary-button" disabled={saving || !email || !password} onClick={save}>{saving ? 'Saving…' : configured ? 'Update login' : 'Save login'}</button>
    {message && <small className="account-card__message">{message}</small>}
  </section>
}

function QuickAddModal({ meal, onClose, onLog }: {
  meal: MealType; onClose: () => void; onLog: (food: Food, meal: MealType) => void
}) {
  const [error, setError] = useState('')
  const [quick, setQuick] = useState({ name: '', calories: '', protein: '', fiber: '' })
  const add = () => {
    if (![quick.calories, quick.protein, quick.fiber].some(value => value !== '')) return setError('Add at least one nutritional value.')
    const nutrients = emptyNutrients()
    for (const key of ['calories', 'protein', 'fiber'] as const) nutrients[key] = Math.max(0, Number(quick[key]) || 0)
    const item: Food = { id: `quick-${crypto.randomUUID()}`, name: quick.name.trim() || 'Quick add', servingLabel: '1 entry', servingGrams: 0, nutrients, source: 'custom' }
    onLog(item, meal)
  }
  return <div className="modal-backdrop" role="presentation">
    <div className="modal-sheet" role="dialog" aria-modal="true" aria-label="Quick add nutrition">
      <ModalHandle onClose={onClose} />
      <header className="modal-header"><div><span className="eyebrow">Add to {meal}</span><h2>Quick add</h2></div><button onClick={onClose}><X /></button></header>
      <div className="custom-form"><label>Name <small>(optional)</small><input value={quick.name} onChange={event => setQuick({ ...quick, name: event.target.value })} placeholder="e.g. Restaurant meal adjustment" /></label><div className="quick-grid">{(['calories', 'protein', 'fiber'] as const).map(key => <label key={key}>{key[0].toUpperCase() + key.slice(1)} <small>(optional)</small><input type="number" inputMode="decimal" min="0" value={quick[key]} onChange={event => setQuick({ ...quick, [key]: event.target.value })} /></label>)}</div><button className="primary-button" onClick={add}><Plus /> Add to {meal}</button></div>
      {error && <p className="error-message">{error}</p>}
    </div>
  </div>
}

function EntryDetailModal({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const nutrients = scaleNutrients(entry.food, entry.servings)
  return <div className="modal-backdrop" role="presentation">
    <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={`${entry.food.name} nutrition details`}>
      <ModalHandle onClose={onClose} />
      <header className="modal-header"><div><span className="eyebrow">{entry.source === 'mynetdiary' ? 'MyNetDiary · Read only' : 'Nourish entry'}</span><h2>{entry.food.name}</h2></div><button onClick={onClose}><X /></button></header>
      <div className="entry-detail-summary"><span>{entry.meal}</span><strong>{entry.food.servingLabel}</strong><small>{friendlyDate(entry.date)}</small></div>
      <div className="nutrient-detail-grid">{[{ key: 'calories' as const, label: 'Calories', unit: 'kcal' }, ...nutrientMeta, ...extraNutrients].map(item => <div key={item.key}><span>{item.label}</span><strong>{round(nutrients[item.key], 1)} {item.unit}</strong></div>)}</div>
      {entry.source === 'mynetdiary' && <p className="readonly-note">Synced items can only be changed in MyNetDiary. Your next sync will update Nourish.</p>}
    </div>
  </div>
}

function App() {
  const [data, setData] = useState<AppData>(loadData)
  const [view, setView] = useState<View>('today')
  const [date, setDate] = useState(todayKey)
  const [addMeal, setAddMeal] = useState<MealType | null>(null)
  const [photoMeal, setPhotoMeal] = useState<MealType | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [toast, setToast] = useState('')
  const [syncing, setSyncing] = useState(false)
  const entries = useMemo(() => data.entries.filter(entry => entry.date === date), [data.entries, date])

  useEffect(() => {
    let active = true
    bootstrapData()
      .then(remote => { if (active) setData(remote) })
      .catch(error => { if (active) setToast(error instanceof Error ? error.message : 'Could not load Nourish data.') })

    const refresh = () => fetchData().then(remote => { if (active) setData(remote) }).catch(() => {})
    const interval = window.setInterval(refresh, 10_000)
    const onVisibility = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timeout) }, [toast])

  const commit = async (mutation: DataMutation) => {
    try {
      const remote = await mutateData(mutation)
      setData(remote)
      return true
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not save Nourish data.')
      return false
    }
  }

  const logFood = (food: Food, meal: MealType) => {
    const entry: DiaryEntry = { id: crypto.randomUUID(), date, meal, food, servings: 1, loggedAt: Date.now(), source: 'nourish-manual' }
    void commit({ type: 'addEntries', entries: [entry] }).then(saved => {
      if (saved) { setAddMeal(null); setToast(`${food.name} added to ${meal.toLowerCase()}`) }
    })
  }
  const openAdd = (meal: MealType = 'Breakfast') => setAddMeal(meal)
  const logPhotoMeal = (foods: Food[], meal: MealType) => {
    const now = Date.now()
    const entries: DiaryEntry[] = foods.map((food, index) => ({ id: crypto.randomUUID(), date, meal, food, servings: 1, loggedAt: now + index, source: 'nourish-photo' }))
    void commit({ type: 'addEntries', entries }).then(saved => {
      if (saved) { setPhotoMeal(null); setToast(`Estimated ${meal.toLowerCase()} logged from ${foods.length} item${foods.length === 1 ? '' : 's'}`) }
    })
  }
  const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
    { id: 'today', label: 'Today', icon: Home }, { id: 'diary', label: 'Diary', icon: Apple },
    { id: 'insights', label: 'Insights', icon: BarChart3 }, { id: 'goals', label: 'Goals', icon: Target },
  ]
  const syncMyNetDiary = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync-mynetdiary', { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'MyNetDiary sync failed.')
      const imported = payload.entries as DiaryEntry[]
      const importedYears = new Set<string>([String(payload.exportYear), ...imported.map(entry => entry.date.slice(0, 4))])
      const saved = await commit({ type: 'replaceMyNetDiary', entries: imported, years: [...importedYears], syncedAt: Date.now() })
      if (saved) setToast(payload.fresh ? `Downloaded and synced ${imported.length} MyNetDiary food entries` : `Synced ${imported.length} entries from the latest MyNetDiary download`)
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'MyNetDiary sync failed.')
    } finally { setSyncing(false) }
  }
  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <div className="brand"><span><Apple /></span><strong>Nourish</strong></div>
      <nav>{navItems.map(item => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}><item.icon />{item.label}</button>)}</nav>
      <div className="sidebar-profile"><CircleUserRound /><span><strong>Jake</strong><small>Personal diary</small></span></div>
    </aside>
    <main className="app-main">
      <header className="app-header"><div><span className="eyebrow">Nutrition diary</span><h1>{view === 'today' ? 'Good day, Jake' : view[0].toUpperCase() + view.slice(1)}</h1></div><div className="header-actions"><button className="today-button" onClick={() => { setDate(todayKey()); setView('today') }}><Home />Today</button><button className="sync-button" onClick={syncMyNetDiary} disabled={syncing}><RefreshCw className={syncing ? 'spinning' : ''} />{syncing ? 'Syncing' : 'Sync'}</button><button className="avatar" onClick={() => setView('goals')}>J</button></div></header>
      {view !== 'goals' && <DatePicker date={date} onChange={setDate} />}
      <div className="content">
        {view === 'today' && <Dashboard entries={entries} goals={data.goals} onPhoto={() => setPhotoMeal('Breakfast')} onManual={openAdd} onViewDiary={() => setView('diary')} />}
        {view === 'diary' && <Diary entries={entries} onAdd={openAdd} onSelect={setSelectedEntry} onDelete={id => { void commit({ type: 'deleteEntry', id }) }} />}
        {view === 'insights' && <Insights data={data} date={date} />}
        {view === 'goals' && <GoalsView goals={data.goals} onSave={goals => { void commit({ type: 'updateGoals', goals }).then(saved => { if (saved) setToast('Nutrition goals saved') }) }} />}
      </div>
    </main>
    <nav className="bottom-nav">{navItems.map(item => <button className={view === item.id ? 'active' : ''} key={item.id} onClick={() => setView(item.id)}><item.icon /><span>{item.label}</span></button>)}</nav>
    <button className="fab" onClick={() => setPhotoMeal('Breakfast')} aria-label="Photograph meal"><Camera /></button>
    {addMeal && <QuickAddModal meal={addMeal} onClose={() => setAddMeal(null)} onLog={logFood} />}
    {photoMeal && <PhotoMealModal defaultMeal={photoMeal} onClose={() => setPhotoMeal(null)} onLog={logPhotoMeal} />}
    {selectedEntry && <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    {toast && <div className="toast"><Sparkles />{toast}</div>}
  </div>
}

export default App
