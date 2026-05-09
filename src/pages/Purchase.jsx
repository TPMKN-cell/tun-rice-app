import React, { useState } from 'react'
import { Section, FormRow, FormGroup, Input, Select, Btn, Badge, fmt, today } from '../components/UI.jsx'
import s from './Pages.module.css'

// transport is now per-bag (user enters per-bag, system calculates total)
const INIT = { date: today(), supplier: '', type: '', qty: '', weight: '', price: '', transport: '' }

export default function Purchase({ store, toast }) {
  const { purchases, payments, getRiceTypes, addPurchase, delPurchase } = store
  const [form, setForm]     = useState(INIT)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const price          = parseFloat(form.price)     || 0
  const qty            = parseFloat(form.qty)        || 0
  const weightPerBag   = parseFloat(form.weight)     || 0   // per bag input
  const transport      = parseFloat(form.transport)  || 0   // per bag input
  const weightTotal    = weightPerBag * qty                  // auto-calculated
  const transportTotal = transport * qty                     // auto-calculated
  const perBag         = price + transport
  const total          = perBag * qty

  // Only show price/weight/transport fields after qty is entered
  const showPriceFields = qty > 0
  // Only show summary after qty + price are entered
  const showSummary = qty > 0 && price > 0

  const save = () => {
    if (!form.date || !form.supplier || !form.type || !qty || !price) {
      toast('⚠️ လိုအပ်သောအချက်များ ဖြည့်ပါ'); return
    }
    addPurchase({ ...form, qty, price, weight: weightTotal, weightPerBag, transport, transportTotal, total })
    setForm(INIT)
    toast('✅ ဝယ်ယူမှု သိမ်းဆည်းပြီးပါပြီ')
  }

  const types = getRiceTypes()
  const rows  = purchases.filter(p =>
    (!filter || p.type === filter) &&
    (!search || p.supplier.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()))
  )
  const shownTypes = [...new Set(rows.map(r => r.type))]
  const getPaidForType = (type) =>
    payments.filter(p => p.type === type && p.category !== 'စရံ').reduce((a,p) => a + p.amount, 0)

  return (
    <div>
      <Section title="🛒 ဝယ်ယူမှု ထည့်ရန်">

        {/* Step 1: Date, Supplier, Type, Qty only */}
        <FormRow>
          <FormGroup label="📅 ရက်စွဲ *">
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </FormGroup>
          <FormGroup label="🏭 စက်ရုံ / Supplier *">
            <Input value={form.supplier} onChange={e => set('supplier', e.target.value)} placeholder="မြဝတီဆန်စက်" list="sup-list" />
            <datalist id="sup-list">{[...new Set(purchases.map(p=>p.supplier))].map(s=><option key={s} value={s}/>)}</datalist>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup label="🌾 ဆန်အမျိုးအစား *" full>
            <Input value={form.type} onChange={e => set('type', e.target.value)} placeholder="ပေါ်ဆန်း၊ ကော်ဆန်" list="type-list" />
            <datalist id="type-list">{types.map(t=><option key={t} value={t}/>)}</datalist>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup label="🔢 အရေအတွက် (အိတ်) *" full>
            <Input type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="အိတ်" min="1" />
          </FormGroup>
        </FormRow>

        {/* Step 2: Per-bag inputs — appear only after qty is entered */}
        {showPriceFields && (
          <>
            <div className={s.stepHint}>💡 အရေအတွက် {fmt(qty)} အိတ် — တစ်အိတ်ချင်း အချက်အလက်များ ဖြည့်ပါ</div>
            <FormRow>
              <FormGroup label="💰 တစ်အိတ်ဈေး (ကျပ်) *">
                <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="ကျပ်" />
              </FormGroup>
              <FormGroup label="🚛 ကားခ / တစ်အိတ် (ကျပ်)">
                <Input type="number" value={form.transport} onChange={e => set('transport', e.target.value)} placeholder="0" />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup label="⚖️ အလေးချိန် / တစ်အိတ် (ပိဿာ)" full>
                <Input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="ပိဿာ" />
              </FormGroup>
            </FormRow>
          </>
        )}

        {/* Step 3: Summary — appears only after qty + price entered */}
        {showSummary && (
          <div className={s.summaryBox}>
            <div className={s.summaryTitle}>📊 စုစုပေါင်း အကျဉ်းချုပ်</div>

            <div className={s.summaryGrid4}>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--gold)'}}>{fmt(total)}</div>
                <div className={s.siLbl}>💵 Total ကျငွေ (ကျပ်)</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--blue)'}}>{fmt(qty)}</div>
                <div className={s.siLbl}>📦 အိတ်အရေအတွက်</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--text2)'}}>{fmt(transportTotal)}</div>
                <div className={s.siLbl}>🚛 ကားခ Total (ကျပ်)</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--green)'}}>{weightTotal ? fmt(weightTotal) : '—'}</div>
                <div className={s.siLbl}>⚖️ ပိဿာ Total</div>
              </div>
            </div>

            <div className={s.summaryDivider}>
              <span>📦 ၁ အိတ်ချင်း အကျဉ်းချုပ်</span>
            </div>

            <div className={s.perBagRow}>
              <div className={s.perBagItem}>
                <div className={s.pbVal}>{fmt(price)}</div>
                <div className={s.pbLbl}>ဆန်ဈေး (ကျပ်)</div>
              </div>
              <div className={s.pbOp}>+</div>
              <div className={s.perBagItem}>
                <div className={s.pbVal} style={{color:'var(--text2)'}}>{fmt(transport)}</div>
                <div className={s.pbLbl}>ကားခ/အိတ် (ကျပ်)</div>
              </div>
              <div className={s.pbOp}>=</div>
              <div className={`${s.perBagItem} ${s.perBagHighlight}`}>
                <div className={s.pbVal} style={{color:'var(--gold)', fontSize:18}}>{fmt(perBag)}</div>
                <div className={s.pbLbl}>ကျသင့်/အိတ် (ကျပ်)</div>
              </div>
              {weightPerBag > 0 && (
                <>
                  <div className={s.pbOp}>·</div>
                  <div className={s.perBagItem}>
                    <div className={s.pbVal} style={{color:'var(--green)'}}>{fmt(weightPerBag)}</div>
                    <div className={s.pbLbl}>ပိဿာ/အိတ်</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className={s.formBtns}>
          <Btn variant="outline" onClick={() => setForm(INIT)}>🔄 ဖျက်</Btn>
          <Btn variant="gold" onClick={save}>💾 သိမ်းမည်</Btn>
        </div>
      </Section>

      {/* ── Records ── */}
      <Section title="📋 ဝယ်ယူမှု မှတ်တမ်းများ">
        <div className={s.filterRow}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ရှာဖွေ..." />
          <Select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">ဆန်အမျိုးအစားအားလုံး</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>

        {shownTypes.map(type => {
          const typeRows = rows.filter(r => r.type === type)
          const cost     = typeRows.reduce((a,r) => a + r.total, 0)
          const paid     = getPaidForType(type)
          const remain   = Math.max(0, cost - paid)
          const pct      = cost > 0 ? Math.min(100, Math.round(paid/cost*100)) : 0
          const col      = remain <= 0 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--red)'
          return (
            <div key={type} className={s.supCard} style={{ marginBottom: 10 }}>
              <div className={s.supCardTop}>
                <strong style={{ color:'var(--gold)', fontSize:14 }}>🌾 {type}</strong>
                <span style={{ fontSize:12, fontWeight:600, color:col }}>
                  {remain <= 0 ? '✅ ပြေပြေလည်လည်' : `⚠️ ${fmt(remain)} ကျပ် ကျန်`}
                </span>
              </div>
              <div className={s.miniGrid}>
                <div className={s.mini}><div style={{color:'var(--gold)',fontWeight:700}}>{fmt(cost)}</div><div className={s.miniLbl}>ကုန်ကျ (ကျပ်)</div></div>
                <div className={s.mini}><div style={{color:'var(--green)',fontWeight:700}}>{fmt(paid)}</div><div className={s.miniLbl}>ပေးပြီး (ကျပ်)</div></div>
                <div className={s.mini}><div style={{color:col,fontWeight:700}}>{fmt(remain)}</div><div className={s.miniLbl}>ပေးရန်ကျန် (ကျပ်)</div></div>
              </div>
              <div className={s.progressTrack}><div className={s.progressFill} style={{width:`${pct}%`,background:col}}/></div>
              <div className={s.pctLabel}>{pct}% ပေးပြီး</div>
            </div>
          )
        })}

        {/* Desktop table */}
        <div className={`${s.tableWrap} ${s.desktopOnly}`}>
          {!rows.length ? <p className="no-data">မှတ်တမ်း မရှိသေးပါ</p> :
          <table>
            <thead><tr>
              <th>ရက်စွဲ</th><th>စက်ရုံ</th><th>ဆန်အမျိုး</th>
              <th>အိတ်</th><th>ပိဿာ Total</th><th>ပိဿာ/အိတ်</th>
              <th>တစ်အိတ်ဈေး</th><th>ကားခ/အိတ်</th><th>ကျသင့်/အိတ်</th>
              <th>ကားခ Total</th><th>Total ကျငွေ</th><th>ပေးပြီး</th><th>ကျန်</th><th></th>
            <tbody>
              {rows.map(p => {
                const paid    = getPaidForType(p.type) * (p.total / Math.max(1, purchases.filter(x=>x.type===p.type).reduce((a,x)=>a+x.total,0)))
                const remain  = Math.max(0, p.total - paid)
                const col     = remain <= 0 ? 'var(--green)' : 'var(--red)'
                const wPerBag = p.qty > 0 && p.weight ? p.weight / p.qty : 0
                return (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>{p.supplier}</td>
                    <td><Badge type="gold">{p.type}</Badge></td>
                    <td className="num">{fmt(p.qty)}</td>
                    <td className="num" style={{color:'var(--green)'}}>{p.weight ? fmt(p.weight) : '—'}</td>
                    <td className="num" style={{color:'var(--green)'}}>{wPerBag ? fmt(wPerBag) : '—'}</td>
                    <td className="num">{fmt(p.price)}</td>
                    <td className="num" style={{color:'var(--text2)'}}>{fmt(p.transport)}</td>
                    <td className="num" style={{color:'var(--blue)',fontWeight:700}}>{fmt(p.price + p.transport)}</td>
                    <td className="num" style={{color:'var(--text2)'}}>{fmt(p.transportTotal||0)}</td>
                    <td className="num" style={{color:'var(--gold)',fontWeight:700}}>{fmt(p.total)}</td>
                    <td className="num" style={{color:'var(--green)'}}>{fmt(paid)}</td>
                    <td className="num" style={{color:col,fontWeight:800}}>{fmt(remain)}</td>
                    <td><Btn variant="red" size="sm" onClick={() => delPurchase(p.id)}>🗑️</Btn></td>
                  </tr>
                )
              })}
            </tbody>
          </table>}
        </div>

        {/* Mobile cards */}
        <div className={s.mobileOnly}>
          {!rows.length && <p className="no-data">မှတ်တမ်း မရှိသေးပါ</p>}
          {rows.map(p => {
            const paid    = getPaidForType(p.type) * (p.total / Math.max(1, purchases.filter(x=>x.type===p.type).reduce((a,x)=>a+x.total,0)))
            const remain  = Math.max(0, p.total - paid)
            const pct     = p.total > 0 ? Math.min(100, Math.round(paid/p.total*100)) : 0
            const col     = remain <= 0 ? 'var(--green)' : 'var(--red)'
            const wPerBag = p.qty > 0 && p.weight ? p.weight / p.qty : 0
            return (
              <div key={p.id} className={s.purCard}>
                <div className={s.purCardHead}>
                  <div>
                    <div className={s.purCardSupplier}>{p.supplier}</div>
                    <div className={s.purCardMeta}>📅 {p.date} · <Badge type="gold">{p.type}</Badge></div>
                  </div>
                  <Btn variant="red" size="sm" onClick={() => delPurchase(p.id)}>🗑️</Btn>
                </div>

                {/* 4 totals */}
                <div className={s.miniGrid} style={{marginBottom:8}}>
                  <div className={s.mini}><div style={{color:'var(--gold)',fontWeight:700}}>{fmt(p.total)}</div><div className={s.miniLbl}>💵 Total ကျငွေ</div></div>
                  <div className={s.mini}><div style={{color:'var(--blue)',fontWeight:700}}>{fmt(p.qty)}</div><div className={s.miniLbl}>📦 အိတ်အရေ</div></div>
                  <div className={s.mini}><div style={{color:'var(--text2)',fontWeight:700}}>{fmt(p.transportTotal||0)}</div><div className={s.miniLbl}>🚛 ကားခ Total</div></div>
                  <div className={s.mini}><div style={{color:'var(--green)',fontWeight:700}}>{p.weight ? fmt(p.weight) : '—'}</div><div className={s.miniLbl}>⚖️ ပိဿာ Total</div></div>
                </div>

                {/* Per-bag line */}
                <div className={s.mobilePerBag}>
                  <div className={s.mpbItem}><span className={s.mpbLbl}>တစ်အိတ်ဈေး</span><span className={s.mpbVal}>{fmt(p.price)} ကျပ်</span></div>
                  <div className={s.mpbItem}><span className={s.mpbLbl}>ကားခ/အိတ်</span><span className={s.mpbVal}>{fmt(p.transport)} ကျပ်</span></div>
                  <div className={s.mpbItem}><span className={s.mpbLbl}>ကျသင့်/အိတ်</span><span style={{fontWeight:800,color:'var(--gold)',fontSize:14}}>{fmt(p.price+p.transport)} ကျပ်</span></div>
                  {wPerBag > 0 && <div className={s.mpbItem}><span className={s.mpbLbl}>ပိဿာ/အိတ်</span><span className={s.mpbVal} style={{color:'var(--green)'}}>{fmt(wPerBag)} ပိဿာ</span></div>}
                </div>

                <div className={s.purTotals}>
                  <div className={s.purTRow}><span>ပေးပြီးငွေ</span><span style={{color:'var(--green)',fontWeight:700}}>{fmt(paid)} ကျပ်</span></div>
                  <div className={`${s.purTRow} ${s.purTFinal}`}><span>ပေးရန်ကျန်</span><span style={{color:col,fontWeight:800,fontSize:15}}>{fmt(remain)} ကျပ်</span></div>
                </div>
                <div className={s.progressTrack}><div className={s.progressFill} style={{width:`${pct}%`,background:col}}/></div>
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
