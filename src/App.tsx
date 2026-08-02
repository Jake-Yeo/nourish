import { useEffect, useMemo, useState } from 'react'
import {
  Apple, BarChart3, CalendarDays, Camera, ChevronLeft, ChevronRight, CircleUserRound,
  Home, KeyRound, Plus, RefreshCw, Sparkles, Target, Trash2, X,
} from 'lucide-react'
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
  return <div className="relative grid size-28 shrink-0 place-items-center rounded-full min-[441px]:size-32" style={{ background: `conic-gradient(#23795e ${pct * 360}deg, #e7ede9 0)` }}>
    <div className="absolute inset-[9px] rounded-full bg-white" />
    <div className="relative z-10 flex flex-col items-center">
      <strong className="text-[25px] tracking-[-0.04em]">{Math.max(0, Math.round(goal - value)).toLocaleString()}</strong>
      <span className="text-[11px] font-bold text-[#71807a]">cal left</span>
    </div>
  </div>
}

function NutrientBar({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const pct = Math.min(value / Math.max(goal, 1) * 100, 100)
  return <div>
    <div className="mb-2 flex justify-between gap-2 text-xs text-[#71807a]"><span className="font-bold text-[#192420]">{label}</span><span><b className="text-[#192420]">{round(value, 1)}</b> / {goal}{unit}</span></div>
    <div className="h-[7px] overflow-hidden rounded-full bg-[#edf1ee]"><span className="block h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} /></div>
  </div>
}

function DatePicker({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const buttonClass = 'flex h-[38px] cursor-pointer items-center justify-center rounded-xl bg-transparent hover:bg-[#f4f7f4] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#23795e]/20'
  return <div className="mb-[18px] grid grid-cols-[42px_1fr_42px] gap-2 rounded-[18px] border border-[#e3e9e5] bg-white p-[7px] shadow-[0_7px_25px_rgba(30,68,52,0.04)]">
    <button className={buttonClass} onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous day"><ChevronLeft className="w-[19px]" /></button>
    <button className={`${buttonClass} gap-2 font-bold`} onClick={() => onChange(todayKey())}>
      <CalendarDays size={17} /><span>{friendlyDate(date)}</span>
    </button>
    <button className={buttonClass} onClick={() => onChange(shiftDate(date, 1))} aria-label="Next day"><ChevronRight className="w-[19px]" /></button>
  </div>
}

function Dashboard({ entries, goals, onPhoto, onManual, onViewDiary }: {
  entries: DiaryEntry[]; goals: Goals; onPhoto: () => void; onManual: (meal?: MealType) => void; onViewDiary: () => void
}) {
  const totals = totalNutrients(entries)
  const loggedMeals = new Set(entries.map(entry => entry.meal)).size
  const caloriePct = Math.round(totals.calories / goals.calories * 100)
  return <>
    <section className="grid grid-cols-[1fr_112px] gap-3 overflow-hidden rounded-[25px] border border-[#e3e9e5] bg-white p-5 shadow-[0_16px_40px_rgba(23,51,40,0.08)] min-[441px]:grid-cols-[1fr_128px] min-[441px]:gap-5 min-[441px]:p-6">
      <div className="self-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f2eb] px-2.5 py-[7px] text-[11px] font-extrabold tracking-[0.08em] text-[#155b46] uppercase"><Sparkles size={14} /> Daily plan</span>
        <h2 className="my-1.5 mt-2.5 max-w-[300px] text-[21px] font-bold tracking-[-0.035em] min-[441px]:text-2xl">{entries.length ? `${caloriePct}% of your calorie goal` : 'Ready when you are'}</h2>
        <p className="m-0 text-sm text-[#71807a]">{entries.length ? `${loggedMeals} meal${loggedMeals === 1 ? '' : 's'} logged today` : 'Log your first meal to start the day.'}</p>
      </div>
      <ProgressRing value={totals.calories} goal={goals.calories} />
      <div className="col-span-full flex items-center justify-around rounded-[18px] bg-[#f4f7f4] p-4">
        <div className="flex flex-col items-center"><strong className="text-xl">{Math.round(totals.calories).toLocaleString()}</strong><span className="text-[11px] text-[#71807a]">Food</span></div>
        <span className="text-[13px] font-bold text-[#71807a]">of</span>
        <div className="flex flex-col items-center"><strong className="text-xl">{goals.calories.toLocaleString()}</strong><span className="text-[11px] text-[#71807a]">Daily goal</span></div>
      </div>
      <button className="col-span-full flex min-h-[49px] cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-linear-to-br from-[#23795e] to-[#2c9470] font-extrabold text-white shadow-[0_9px_20px_rgba(35,121,94,0.2)] hover:from-[#155b46] hover:to-[#23795e]" onClick={onPhoto}><Camera size={19} /> Photograph meal</button>
      <button className="col-span-full mt-1 cursor-pointer bg-transparent text-xs font-bold text-[#23795e]" onClick={() => onManual()}>Add a correction manually</button>
    </section>

    <section className="rounded-[25px] border border-[#e3e9e5] bg-white p-[21px] shadow-[0_16px_40px_rgba(23,51,40,0.08)]">
      <div className="mb-[18px] flex items-end justify-between"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Nutrition</span><h3 className="mt-[3px] text-[21px] font-bold tracking-[-0.025em]">Your macros</h3></div><button className="cursor-pointer bg-transparent py-[7px] text-[13px] font-extrabold text-[#23795e]" onClick={onViewDiary}>Details</button></div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-[18px] min-[441px]:grid-cols-2">{nutrientMeta.map(item => <NutrientBar key={item.key} label={item.label} unit={item.unit} color={item.color} value={totals[item.key]} goal={goals[item.key]} />)}</div>
    </section>

    <section className="rounded-[25px] border border-[#e3e9e5] bg-white p-[21px] pb-2 shadow-[0_16px_40px_rgba(23,51,40,0.08)]">
      <div className="mb-[18px] flex items-end justify-between"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Diary</span><h3 className="mt-[3px] text-[21px] font-bold tracking-[-0.025em]">Meals</h3></div><button className="cursor-pointer bg-transparent py-[7px] text-[13px] font-extrabold text-[#23795e]" onClick={onViewDiary}>View all</button></div>
      {mealTypes.map(meal => {
        const mealEntries = entries.filter(entry => entry.meal === meal)
        const cals = totalNutrients(mealEntries).calories
        const iconTone = meal === 'Lunch' ? 'bg-[#fff1da] text-[#c0791d]' : meal === 'Dinner' ? 'bg-[#e9e5f8] text-[#7055bf]' : meal === 'Snacks' ? 'bg-[#f9e4e5] text-[#b8535a]' : 'bg-[#e3f2eb] text-[#23795e]'
        return <div className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-[#e3e9e5] py-[13px]" key={meal}>
          <span className={`grid size-[39px] shrink-0 place-items-center overflow-hidden rounded-xl ${iconTone}`}><Apple size={18} /></span>
          <span className="flex flex-col"><strong className="text-sm">{meal}</strong><small className="mt-0.5 text-[#71807a]">{mealEntries.length ? `${mealEntries.length} item${mealEntries.length === 1 ? '' : 's'}` : 'Nothing logged'}</small></span>
          <span className="text-[13px] font-bold text-[#71807a]">{Math.round(cals)} cal</span><button className="grid size-[34px] cursor-pointer place-items-center rounded-[10px] bg-transparent hover:bg-[#f7e8e9]" onClick={() => onManual(meal)} aria-label={`Quick add to ${meal}`}><Plus size={18} /></button>
        </div>
      })}
    </section>
  </>
}

function Diary({ entries, onAdd, onDelete, onSelect }: { entries: DiaryEntry[]; onAdd: (meal: MealType) => void; onDelete: (id: string) => void; onSelect: (entry: DiaryEntry) => void }) {
  return <div className="grid gap-3.5">{mealTypes.map(meal => {
    const items = entries.filter(entry => entry.meal === meal)
    const totals = totalNutrients(items)
    return <section className="rounded-[25px] border border-[#e3e9e5] bg-white p-[18px]" key={meal}>
      <div className="flex items-center justify-between pb-3.5"><div><h3 className="text-lg font-bold">{meal}</h3><span className="text-xs text-[#71807a]">{Math.round(totals.calories)} cal · {round(totals.protein, 1)}g protein</span></div><button className="grid size-9 cursor-pointer place-items-center rounded-xl bg-[#e3f2eb] text-[#23795e]" onClick={() => onAdd(meal)}><Plus className="w-[18px]" /></button></div>
      {items.length === 0 ? <button className="w-full cursor-pointer rounded-[14px] border border-dashed border-[#ccd8d1] bg-[#f9fbf9] p-[17px] font-bold text-[#23795e]" onClick={() => onAdd(meal)}>Add {meal.toLowerCase()}</button> : items.map(entry => {
        const n = scaleNutrients(entry.food, entry.servings)
        const sourceTone = entry.source === 'mynetdiary' ? 'bg-[#e8f2ff] text-[#32639b]' : entry.source === 'nourish-photo' ? 'bg-[#eee9ff] text-[#6950ae]' : 'bg-[#f4f7f4] text-[#71807a]'
        return <div className="grid cursor-pointer grid-cols-[auto_1fr_auto_auto] items-center gap-[11px] border-t border-[#e3e9e5] py-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#23795e]/20" key={entry.id} role="button" tabIndex={0} onClick={() => onSelect(entry)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') onSelect(entry) }}>
          <div className="grid size-[39px] shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e3f2eb] text-[#23795e]">{entry.food.image ? <img className="size-full object-cover" src={entry.food.image} alt="" /> : <Apple size={20} />}</div>
          <div className="flex min-w-0 flex-col"><strong className="overflow-hidden text-[13px] text-ellipsis whitespace-nowrap">{entry.food.name}</strong><span className="mt-0.5 text-[11px] text-[#71807a]">{round(entry.servings, 2)} × {entry.food.servingLabel}</span><small className={`mt-1 self-start rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${sourceTone}`}>{entry.source === 'mynetdiary' ? 'MyNetDiary' : entry.source === 'nourish-photo' ? 'AI photo' : entry.source === 'nourish-barcode' ? 'Barcode' : 'Nourish'}</small></div>
          <div className="flex flex-col items-end"><strong>{Math.round(n.calories)}</strong><span className="text-[10px] text-[#71807a]">cal</span></div>
          {entry.source !== 'mynetdiary' && <button className="grid size-[34px] cursor-pointer place-items-center rounded-[10px] bg-transparent text-[#be5c61] hover:bg-[#f7e8e9]" onClick={event => { event.stopPropagation(); onDelete(entry.id) }} aria-label={`Delete ${entry.food.name}`}><Trash2 className="w-4" /></button>}
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
    <section className="rounded-[25px] bg-linear-to-br from-[#173b31] to-[#246e57] p-6 text-white shadow-[0_16px_40px_rgba(23,51,40,0.08)]">
      <div className="flex items-start justify-between gap-3.5"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#b8dfce] uppercase">{range}-day view</span><h2 className="mt-[5px] mb-5 text-[27px] font-bold tracking-[-0.04em]">Your nutrition trend</h2></div><label className="flex items-center gap-[7px] text-[11px] font-bold text-[#c5ded3]">Days<select className="min-h-10 w-[68px] rounded-[10px] border border-white/25 bg-[#275d4d] px-[9px] py-[7px] text-center text-base font-extrabold text-white outline-none" value={range} onChange={event => setRange(Number(event.target.value))}>{Array.from({ length: 89 }, (_, index) => index + 2).map(days => <option key={days} value={days}>{days}</option>)}</select></label></div>
      <div className="flex h-[150px] items-end justify-around gap-2.5 pt-2.5">
        {daily.map((item, index) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={item.day} title={`${friendlyDate(item.day)}: ${Math.round(item.totals.calories)} calories`}>
          <span className="min-h-1 w-full max-w-[34px] rounded-t-lg rounded-b-[3px] bg-[#c7e16e]" style={{ height: `${Math.max(4, Math.min(item.totals.calories / data.goals.calories * 100, 100))}%` }} />
          <small className="text-[#bad4c9]">{range <= 14 || index === 0 || index === range - 1 || index % Math.ceil(range / 7) === 0 ? new Date(`${item.day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'narrow' }) : ''}</small>
        </div>)}
      </div>
      <p className="mt-[19px] text-[13px] text-[#c5ded3]"><strong className="text-[21px] text-white">{Math.round(averageCalories).toLocaleString()}</strong> average calories per day</p>
      {assumedDays > 0 && <small className="mt-1.5 block leading-[1.4] text-[#a9cbbd]">Used {data.goals.maintenanceCalories.toLocaleString()} calories for {assumedDays} day{assumedDays === 1 ? '' : 's'} logged below 1,000.</small>}
    </section>
    <section className="rounded-[25px] border border-[#e3e9e5] bg-white p-[21px] shadow-[0_16px_40px_rgba(23,51,40,0.08)]">
      <div className="mb-[18px] flex items-end justify-between"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Today</span><h3 className="mt-[3px] text-[21px] font-bold tracking-[-0.025em]">Nutrient report</h3></div></div>
      <div className="grid gap-[17px]">{[...nutrientMeta, ...extraNutrients].map(item => <NutrientBar key={item.key} label={item.label} unit={item.unit} color={'color' in item ? String(item.color) : '#3b8b73'} value={current[item.key]} goal={data.goals[item.key]} />)}</div>
    </section>
    <section className="flex gap-3.5 rounded-[20px] border border-[#d6e5dc] bg-[#e3f2eb] p-[18px]"><div className="grid size-[38px] shrink-0 place-items-center rounded-xl bg-white text-[#23795e]"><Sparkles /></div><p className="text-[13px] leading-[1.5] text-[#557067]"><strong className="text-[#192420]">{current.fiber >= data.goals.fiber ? 'Fiber goal reached.' : `${round(data.goals.fiber - current.fiber, 1)}g fiber to go.`}</strong><br />Try berries, beans, avocado, or whole grains to close the gap.</p></section>
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
    <section className="flex gap-[15px] px-1 pt-1.5 pb-[3px]"><div className="grid size-12 shrink-0 place-items-center rounded-[15px] bg-[#e3f2eb] text-[#23795e]"><Target /></div><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Personal plan</span><h2 className="mt-[3px] mb-1 text-[26px] font-bold tracking-[-0.04em]">Nutrition goals</h2><p className="text-[13px] text-[#71807a]">Set targets that fit how you eat. You can change them anytime.</p></div></section>
    <section className="rounded-[25px] border border-[#e3e9e5] bg-white px-5 py-1">{fields.map(field => <label className="flex items-center justify-between gap-[15px] border-b border-[#e3e9e5] py-4 last:border-b-0" key={field.key}>
      <span className="flex flex-col"><strong className="text-sm">{field.label}</strong><small className="mt-[3px] text-[11px] text-[#71807a]">{field.description}</small></span>
      <span className="flex items-center rounded-[11px] border border-[#e3e9e5] bg-[#f4f7f4] px-2.5 py-0.5"><input className="w-[74px] border-0 bg-transparent px-1 py-[9px] text-right font-bold outline-none" type="number" min="0" step={field.key === 'calories' || field.unit === 'mg' ? 1 : .1} value={draft[field.key]} onChange={event => setDraft({ ...draft, [field.key]: Math.max(0, Number(event.target.value)) })} /><em className="text-[11px] text-[#71807a] not-italic">{field.unit}</em></span>
    </label>)}</section>
    <button className="mb-2 flex min-h-[49px] w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-[#23795e] font-extrabold text-white shadow-[0_9px_20px_rgba(35,121,94,0.2)] hover:bg-[#155b46]" onClick={() => onSave(draft)}>Save goals</button>
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

  const inputClass = 'w-full rounded-[11px] border border-[#e3e9e5] bg-[#f4f7f4] p-3 text-base text-[#192420] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15'
  return <section className="grid gap-[13px] rounded-[22px] border border-[#e3e9e5] bg-white px-5 py-[19px]">
    <div className="flex items-center gap-[11px]"><div className="grid size-[39px] shrink-0 place-items-center rounded-xl bg-[#e3f2eb] text-[#23795e]"><KeyRound className="w-[19px]" /></div><span className="flex flex-col"><strong className="text-sm">MyNetDiary login</strong><small className="text-[11px] text-[#71807a]">{configured ? `Configured for ${emailHint}` : 'Required for automatic headless sync'}</small></span></div>
    <p className="text-[11px] leading-[1.5] text-[#71807a]">Nourish stores this login in the Mac’s Keychain and uses it only when MyNetDiary asks the sync browser to sign in.</p>
    <label className="grid gap-1.5 text-[11px] font-bold text-[#71807a]">Email or account name<input className={inputClass} type="text" autoCapitalize="none" autoCorrect="off" value={email} onChange={event => setEmail(event.target.value)} placeholder={configured ? 'Enter to replace saved login' : 'MyNetDiary email'} /></label>
    <label className="grid gap-1.5 text-[11px] font-bold text-[#71807a]">Password<input className={inputClass} type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder={configured ? 'Enter to replace saved password' : 'MyNetDiary password'} /></label>
    <button className="min-h-[45px] w-full cursor-pointer rounded-[14px] border border-[#e3e9e5] bg-white font-bold disabled:cursor-not-allowed disabled:opacity-50" disabled={saving || !email || !password} onClick={save}>{saving ? 'Saving…' : configured ? 'Update login' : 'Save login'}</button>
    {message && <small className="text-[11px] text-[#155b46]">{message}</small>}
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
  return <div className="fixed inset-0 z-100 flex items-end justify-center bg-[#0c1914]/48 pt-10 backdrop-blur-[4px] min-[960px]:items-center min-[960px]:p-[30px]" role="presentation">
    <div className="max-h-[92dvh] w-full max-w-[620px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] bg-white px-[19px] pt-[5px] pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(10,30,22,0.22)] [-webkit-overflow-scrolling:touch] min-[960px]:max-h-[88dvh] min-[960px]:rounded-[28px]" role="dialog" aria-modal="true" aria-label="Quick add nutrition">
      <ModalHandle onClose={onClose} />
      <header className="flex items-center justify-between pb-[15px]"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Add to {meal}</span><h2 className="mt-[3px] text-[23px] font-bold tracking-[-0.03em]">Quick add</h2></div><button className="grid size-[39px] cursor-pointer place-items-center rounded-full bg-[#f4f7f4]" onClick={onClose}><X className="w-[19px]" /></button></header>
      <div className="grid gap-[13px]"><label className="grid gap-1.5 text-[11px] font-bold text-[#71807a]">Name <small className="font-medium">(optional)</small><input className="w-full rounded-[11px] border border-[#e3e9e5] p-3 text-base text-[#192420] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" value={quick.name} onChange={event => setQuick({ ...quick, name: event.target.value })} placeholder="e.g. Restaurant meal adjustment" /></label><div className="grid grid-cols-1 gap-2.5 min-[441px]:grid-cols-3">{(['calories', 'protein', 'fiber'] as const).map(key => <label className="grid gap-1.5 text-[11px] font-bold text-[#71807a]" key={key}>{key[0].toUpperCase() + key.slice(1)} <small className="font-medium">(optional)</small><input className="w-full rounded-[11px] border border-[#e3e9e5] p-3 text-base text-[#192420] outline-none focus:border-[#23795e] focus:ring-3 focus:ring-[#23795e]/15" type="number" inputMode="decimal" min="0" value={quick[key]} onChange={event => setQuick({ ...quick, [key]: event.target.value })} /></label>)}</div><button className="flex min-h-[49px] cursor-pointer items-center justify-center gap-2 rounded-[15px] bg-[#23795e] font-extrabold text-white shadow-[0_9px_20px_rgba(35,121,94,0.2)] hover:bg-[#155b46]" onClick={add}><Plus /> Add to {meal}</button></div>
      {error && <p className="mt-3 rounded-[11px] bg-[#fae8e9] px-[13px] py-[11px] text-xs text-[#9b4147]">{error}</p>}
    </div>
  </div>
}

function EntryDetailModal({ entry, onClose }: { entry: DiaryEntry; onClose: () => void }) {
  const nutrients = scaleNutrients(entry.food, entry.servings)
  return <div className="fixed inset-0 z-100 flex items-end justify-center bg-[#0c1914]/48 pt-10 backdrop-blur-[4px] min-[960px]:items-center min-[960px]:p-[30px]" role="presentation">
    <div className="max-h-[92dvh] w-full max-w-[620px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] bg-white px-[19px] pt-[5px] pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(10,30,22,0.22)] [-webkit-overflow-scrolling:touch] min-[960px]:max-h-[88dvh] min-[960px]:rounded-[28px]" role="dialog" aria-modal="true" aria-label={`${entry.food.name} nutrition details`}>
      <ModalHandle onClose={onClose} />
      <header className="flex items-center justify-between pb-[15px]"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">{entry.source === 'mynetdiary' ? 'MyNetDiary · Read only' : 'Nourish entry'}</span><h2 className="mt-[3px] text-[23px] font-bold tracking-[-0.03em]">{entry.food.name}</h2></div><button className="grid size-[39px] cursor-pointer place-items-center rounded-full bg-[#f4f7f4]" onClick={onClose}><X className="w-[19px]" /></button></header>
      <div className="mb-3.5 flex items-center gap-2 rounded-[14px] bg-[#f4f7f4] px-[15px] py-[13px]"><span className="text-[11px] text-[#71807a]">{entry.meal}</span><strong className="mr-auto text-[13px]">{entry.food.servingLabel}</strong><small className="text-[11px] text-[#71807a]">{friendlyDate(entry.date)}</small></div>
      <div className="grid grid-cols-2 gap-2">{[{ key: 'calories' as const, label: 'Calories', unit: 'kcal' }, ...nutrientMeta, ...extraNutrients].map(item => <div className="flex items-center justify-between gap-2 rounded-[11px] border border-[#e3e9e5] px-3 py-[11px]" key={item.key}><span className="text-[11px] text-[#71807a]">{item.label}</span><strong className="text-xs">{round(nutrients[item.key], 1)} {item.unit}</strong></div>)}</div>
      {entry.source === 'mynetdiary' && <p className="mt-3.5 rounded-xl bg-[#e8f2ff] px-3.5 py-3 text-[11px] leading-[1.45] text-[#32639b]">Synced items can only be changed in MyNetDiary. Your next sync will update Nourish.</p>}
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
  return <div className="grid h-dvh min-w-80 overflow-hidden bg-[#f4f7f4] font-[system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#192420] antialiased min-[960px]:grid-cols-[240px_1fr]">
    <aside className="hidden h-dvh flex-col border-r border-[#e3e9e5] bg-white px-5 py-7 min-[960px]:flex">
      <div className="mx-2 mb-10 flex items-center gap-2.5 text-[21px]"><span className="grid size-[38px] place-items-center rounded-xl bg-[#23795e] text-white"><Apple className="w-5" /></span><strong>Nourish</strong></div>
      <nav className="grid gap-[7px]">{navItems.map(item => <button className={`flex cursor-pointer items-center gap-3 rounded-[13px] px-[13px] py-3 text-left font-bold ${view === item.id ? 'bg-[#e3f2eb] text-[#155b46]' : 'bg-transparent text-[#71807a] hover:bg-[#f4f7f4]'}`} key={item.id} onClick={() => setView(item.id)}><item.icon className="w-[19px]" />{item.label}</button>)}</nav>
      <div className="mt-auto flex items-center gap-[9px] rounded-[14px] bg-[#f4f7f4] p-3"><CircleUserRound /><span className="flex flex-col"><strong>Jake</strong><small className="text-[#71807a]">Personal diary</small></span></div>
    </aside>
    <main className="mx-auto h-dvh w-full max-w-[740px] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-auto px-[18px] pt-6 pb-[116px] [-webkit-overflow-scrolling:touch] min-[960px]:max-w-[840px] min-[960px]:px-[30px] min-[960px]:pt-[38px] min-[960px]:pb-[70px]">
      <header className="mb-5 flex items-start justify-between min-[441px]:items-center"><div><span className="text-[11px] font-extrabold tracking-[0.13em] text-[#23795e] uppercase">Nutrition diary</span><h1 className="mt-0.5 text-[clamp(26px,6vw,35px)] leading-[1.05] font-bold tracking-[-0.04em]">{view === 'today' ? 'Good day, Jake' : view[0].toUpperCase() + view.slice(1)}</h1></div><div className="flex items-center gap-[5px] min-[441px]:gap-[9px]"><button className="flex size-[38px] cursor-pointer items-center justify-center rounded-xl border border-[#e3e9e5] bg-white text-[0px] font-extrabold min-[441px]:h-auto min-[441px]:w-auto min-[441px]:gap-[5px] min-[441px]:px-2.5 min-[441px]:py-[9px] min-[441px]:text-xs" onClick={() => { setDate(todayKey()); setView('today') }}><Home className="size-[15px]" />Today</button><button className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#e3e9e5] bg-white p-2 text-xs font-extrabold text-[#23795e] disabled:opacity-60 min-[441px]:px-[11px] min-[441px]:py-[9px]" onClick={syncMyNetDiary} disabled={syncing}><RefreshCw className={`size-[15px] ${syncing ? 'animate-spin' : ''}`} />{syncing ? 'Syncing' : 'Sync'}</button><button className="size-[42px] cursor-pointer rounded-full bg-[#192420] font-extrabold text-white" onClick={() => setView('goals')}>J</button></div></header>
      {view !== 'goals' && <DatePicker date={date} onChange={setDate} />}
      <div className="grid gap-4">
        {view === 'today' && <Dashboard entries={entries} goals={data.goals} onPhoto={() => setPhotoMeal('Breakfast')} onManual={openAdd} onViewDiary={() => setView('diary')} />}
        {view === 'diary' && <Diary entries={entries} onAdd={openAdd} onSelect={setSelectedEntry} onDelete={id => { void commit({ type: 'deleteEntry', id }) }} />}
        {view === 'insights' && <Insights data={data} date={date} />}
        {view === 'goals' && <GoalsView goals={data.goals} onSave={goals => { void commit({ type: 'updateGoals', goals }).then(saved => { if (saved) setToast('Nutrition goals saved') }) }} />}
      </div>
    </main>
    <nav aria-label="Bottom navigation" className="fixed right-0 bottom-0 left-0 z-20 grid h-[calc(72px+env(safe-area-inset-bottom))] touch-none grid-cols-4 overflow-hidden overscroll-none border-t border-[#e3e9e5] bg-white/94 px-2.5 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl [backface-visibility:hidden] [transform:translateZ(0)] min-[960px]:hidden">{navItems.map(item => <button className={`flex cursor-pointer flex-col items-center justify-center gap-1 bg-transparent text-[10px] font-bold ${view === item.id ? 'text-[#23795e]' : 'text-[#87928d]'}`} key={item.id} onClick={() => setView(item.id)}><item.icon className="w-[21px]" /><span>{item.label}</span></button>)}</nav>
    <button className="fixed right-[19px] bottom-[calc(82px+env(safe-area-inset-bottom))] z-22 grid size-[54px] cursor-pointer place-items-center rounded-full border-4 border-[#f4f7f4] bg-[#23795e] text-white shadow-[0_10px_25px_rgba(20,75,56,0.3)] min-[960px]:hidden" onClick={() => setPhotoMeal('Breakfast')} aria-label="Photograph meal"><Camera /></button>
    {addMeal && <QuickAddModal meal={addMeal} onClose={() => setAddMeal(null)} onLog={logFood} />}
    {photoMeal && <PhotoMealModal defaultMeal={photoMeal} onClose={() => setPhotoMeal(null)} onLog={logPhotoMeal} />}
    {selectedEntry && <EntryDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    {toast && <div className="pointer-events-none fixed top-5 left-1/2 z-200 flex -translate-x-1/2 items-center gap-2 rounded-[14px] bg-[#182a23] px-4 py-3 text-xs font-bold text-white shadow-[0_12px_35px_rgba(10,30,22,0.27)] select-none"><Sparkles className="w-4 text-[#c7e16e]" />{toast}</div>}
  </div>
}

export default App
