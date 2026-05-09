import React, { useState } from 'react'
import { Section, FormRow, FormGroup, Input, Btn, Badge, MiniStat, ProgressBar, fmt, today } from '../components/UI.jsx'
import s from './Pages.module.css'

const INIT = { date: today(), type: '', qty: '', buyer: '', price: '', transport: '', note: '' }

export default function Stock({ store, toast }) {
  const { purchases, payments, sales, getRiceTypes, getStockByType, addSale, delSale } = store
  const [form, setForm] = useState(INIT)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const qty       = parseFloat(form.qty)       || 0
  const price     = parseFloat(form.price)     || 0
  const transport = parseFloat(form.transport) || 0  // ကားခ တစ်အိတ်

  const transportTotal = transport * qty   // ကားခ total (auto)
  const perBag         = price + transport // ကျသင့်ငွေ တစ်အိတ်
  const total          = perBag * qty      // Total ကျငွေ

  const showSaleBox = qty > 0 && (price > 0 || transport > 0)

  const types = getRiceTypes()

  const save = () => {
    if (!form.date || !form.type || !qty) { toast('⚠️ လိုအပ်သောအချက်များ ဖြည့်ပါ'); return }
    const stock = getStockByType(form.type)
    if (qty > stock.remaining) { toast(`⚠️ Stock မလောက်ပါ (ကျန်: ${stock.remaining} အိတ်)`); return }
    addSale({ ...form, qty, price, transport, transportTotal, total })
    setForm(INIT)
    toast('✅ ရောင်းချမှု သိမ်းဆည်းပြီးပါပြီ')
  }

  // Helper: get all purchase rows for a type, with derived per-bag data
  const getPurchaseDataForType = (type) => {
    const rows = purchases.filter(p => p.type === type)
    const totalQty     = rows.reduce((a,p) => a + p.qty, 0)
    const totalWeight  = rows.reduce((a,p) => a + (p.weight || 0), 0)
    const totalCost    = rows.reduce((a,p) => a + p.total, 0)
    const totalTransport = rows.reduce((a,p) => a + (p.transportTotal || p.transport * p.qty || 0), 0)

    // weighted averages
    const avgPrice     = totalQty > 0 ? rows.reduce((a,p) => a + p.price * p.qty, 0) / totalQty : 0
    const avgTransport = totalQty > 0 ? totalTransport / totalQty : 0
    const avgPerBag    = avgPrice + avgTransport
    const avgWeight    = totalQty > 0 && totalWeight > 0 ? totalWeight / totalQty : 0

    // paid (exclude deposit)
    const paid    = payments.filter(p => p.type === type && p.category !== 'စရံ').reduce((a,p) => a + p.amount, 0)
    const deposit = payments.filter(p => p.type === type && p.category === 'စရံ').reduce((a,p) => a + p.amount, 0)
    const remain  = Math.max(0, totalCost - paid)

    return { rows, totalQty, totalWeight, totalCost, totalTransport, avgPrice, avgTransport, avgPerBag, avgWeight, paid, deposit, remain }
  }

  return (
    <div>
      {/* ── Sale Form ── */}
      <Section title="📤 ရောင်းချမှု ထည့်ရန်">
        <FormRow>
          <FormGroup label="📅 ရက်စွဲ *">
            <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </FormGroup>
          <FormGroup label="🌾 ဆန်အမျိုးအစား *">
            <Input value={form.type} onChange={e => set('type', e.target.value)} placeholder="ဆန်အမျိုးအစား" list="stock-types" />
            <datalist id="stock-types">{types.map(t => <option key={t} value={t} />)}</datalist>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="🔢 အရေအတွက် (အိတ်) *">
            <Input type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="အိတ်" min="1" />
          </FormGroup>
          <FormGroup label="👤 ဝယ်သူ">
            <Input value={form.buyer} onChange={e => set('buyer', e.target.value)} placeholder="ဝယ်သူ အမည်" />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="💰 တစ်အိတ် ရောင်းဈေး (ကျပ်)">
            <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="ကျပ်" />
          </FormGroup>
          <FormGroup label="🚛 ကားခ တစ်အိတ် (ကျပ်)">
            <Input type="number" value={form.transport} onChange={e => set('transport', e.target.value)} placeholder="0" />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="📝 မှတ်ချက်" full>
            <Input value={form.note} onChange={e => set('note', e.target.value)} placeholder="မှတ်ချက်" />
          </FormGroup>
        </FormRow>

        {/* Sale summary box */}
        {showSaleBox && (
          <div className={s.summaryBox}>
            <div className={s.summaryTitle}>📊 ရောင်းချမှု အကျဉ်းချုပ်</div>
            <div className={s.summaryGrid4}>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--gold)'}}>{fmt(total)}</div>
                <div className={s.siLbl}>💵 Total ကျငွေ (ကျပ်)</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--blue)'}}>{fmt(qty)}</div>
                <div className={s.siLbl}>📦 အိတ်အရေ</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--text2)'}}>{fmt(transportTotal)}</div>
                <div className={s.siLbl}>🚛 ကားခ Total (ကျပ်)</div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.siVal} style={{color:'var(--blue)'}}>{fmt(perBag)}</div>
                <div className={s.siLbl}>📦 ကျသင့်/အိတ် (ကျပ်)</div>
              </div>
            </div>
            <div className={s.summaryDivider}><span>📦 ၁ အိတ်စျေး ဖြတ်သန်း</span></div>
            <div className={s.perBagRow}>
              <div className={s.perBagItem}>
                <div className={s.pbVal}>{fmt(price)}</div>
                <div className={s.pbLbl}>ရောင်းဈေး (ကျပ်)</div>
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
            </div>
          </div>
        )}

        <div className={s.formBtns}>
          <Btn variant="outline" onClick={() => setForm(INIT)}>🔄 ဖျက်</Btn>
          <Btn variant="gold" onClick={save}>💾 သိမ်းမည်</Btn>
        </div>
      </Section>

      {/* ── Stock Status (full data per type) ── */}
      <Section title="📦 Stock အခြေအနေ">
        {!types.length ? <p className="no-data">ဝယ်ယူမှု မရှိသေးပါ</p> :
          types.map(type => {
            const { bought, sold, remaining } = getStockByType(type)
            const pct = bought > 0 ? Math.min(100, Math.round(remaining/bought*100)) : 0
            const col = remaining <= 0 ? 'var(--red)' : pct < 20 ? 'var(--gold)' : 'var(--green)'
            const bt  = remaining <= 0 ? 'red'  : pct < 20 ? 'gold'  : 'green'
            const lbl = remaining <= 0 ? '🔴 မရှိ' : pct < 20 ? '🟡 နည်း' : '🟢 ပုံမှန်'

            const d = getPurchaseDataForType(type)

            return (
              <div key={type} className={s.stockCard}>
                {/* Header */}
                <div className={s.stockCardHead}>
                  <span className={s.supCardName}>🌾 {type}</span>
                  <Badge type={bt}>{lbl}</Badge>
                </div>

                {/* Stock qty row */}
                <div className={s.stockSection}>
                  <div className={s.stockSectionTitle}>📦 Stock အရေအတွက်</div>
                  <div className={s.miniGrid}>
                    <MiniStat val={fmt(bought)}    lbl="ဝယ်ယူ (အိတ်)"   color="var(--blue)"  />
                    <MiniStat val={fmt(sold)}       lbl="ရောင်းချ (အိတ်)"  color="var(--gold)"  />
                    <MiniStat val={fmt(remaining)}  lbl="လက်ကျန် (အိတ်)" color={col}          />
                    {d.totalWeight > 0 && (
                      <MiniStat val={fmt(d.totalWeight)} lbl="ပိဿာ Total" color="var(--green)" />
                    )}
                  </div>
                  <ProgressBar pct={pct} color={col} label={`${pct}% ကျန်`} />
                </div>

                {/* Purchase cost data */}
                <div className={s.stockSection}>
                  <div className={s.stockSectionTitle}>💵 ကုန်ကျစရိတ် အချက်အလက်</div>
                  <div className={s.miniGrid}>
                    <MiniStat val={fmt(d.totalCost)}      lbl="Total ကုန်ကျ (ကျပ်)"  color="var(--gold)"  />
                    <MiniStat val={fmt(d.totalTransport)}  lbl="ကားခ Total (ကျပ်)"    color="var(--text2)" />
                    <MiniStat val={fmt(d.paid)}            lbl="ပေးပြီးငွေ (ကျပ်)"    color="var(--green)" />
                    <MiniStat val={fmt(d.remain)}          lbl="ပေးရန်ကျန် (ကျပ်)"   color={d.remain<=0?'var(--green)':'var(--red)'} />
                  </div>
                  {d.deposit > 0 && (
                    <div style={{marginTop:6,fontSize:11,color:'var(--green)',fontWeight:600}}>
                      💰 စရံ: {fmt(d.deposit)} ကျပ် (သီးခြား)
                    </div>
                  )}
                </div>

                {/* Per-bag averages */}
                <div className={s.stockSection}>
                  <div className={s.stockSectionTitle}>📦 တစ်အိတ်ချင်း ပျမ်းမျှ</div>
                  <div className={s.perBagRow} style={{background:'var(--bg2)'}}>
                    <div className={s.perBagItem}>
                      <div className={s.pbVal}>{fmt(d.avgPrice)}</div>
                      <div className={s.pbLbl}>ဆန်ဈေး (ကျပ်)</div>
                    </div>
                    <div className={s.pbOp}>+</div>
                    <div className={s.perBagItem}>
                      <div className={s.pbVal} style={{color:'var(--text2)'}}>{fmt(d.avgTransport)}</div>
                      <div className={s.pbLbl}>ကားခ/အိတ် (ကျပ်)</div>
                    </div>
                    <div className={s.pbOp}>=</div>
                    <div className={`${s.perBagItem} ${s.perBagHighlight}`}>
                      <div className={s.pbVal} style={{color:'var(--gold)',fontSize:16}}>{fmt(d.avgPerBag)}</div>
                      <div className={s.pbLbl}>ကျသင့်/အိတ် (ကျပ်)</div>
                    </div>
                    {d.avgWeight > 0 && (
                      <>
                        <div className={s.pbOp}>·</div>
                        <div className={s.perBagItem}>
                          <div className={s.pbVal} style={{color:'var(--green)'}}>{fmt(d.avgWeight)}</div>
                          <div className={s.pbLbl}>ပိဿာ/အိတ်</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )
          })
        }
      </Section>

      {/* ── Sales records ── */}
      <Section title="📋 ရောင်းချမှု မှတ်တမ်းများ">
        {!sales.length ? <p className="no-data">မှတ်တမ်း မရှိသေးပါ</p> :
          <div className={s.tableWrap}>
            <table>
              <thead><tr>
                <th>ရက်စွဲ</th><th>ဆန်အမျိုး</th><th>ဝယ်သူ</th>
                <th>အိတ်</th><th>ရောင်းဈေး/အိတ်</th><th>ကားခ/အိတ်</th>
                <th>ကျသင့်/အိတ်</th><th>ကားခ Total</th><th>Total ကျငွေ</th>
                <th>မှတ်ချက်</th><th></th>
              </tr></thead>
              <tbody>
                {sales.map(p => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td><Badge type="gold">{p.type}</Badge></td>
                    <td>{p.buyer || '—'}</td>
                    <td className="num">{fmt(p.qty)} အိတ်</td>
                    <td className="num">{p.price ? fmt(p.price)+' ကျပ်' : '—'}</td>
                    <td className="num" style={{color:'var(--text2)'}}>{p.transport ? fmt(p.transport)+' ကျပ်' : '—'}</td>
                    <td className="num" style={{color:'var(--blue)',fontWeight:700}}>{p.price||p.transport ? fmt((p.price||0)+(p.transport||0))+' ကျပ်' : '—'}</td>
                    <td className="num" style={{color:'var(--text2)'}}>{p.transportTotal ? fmt(p.transportTotal)+' ကျပ်' : '—'}</td>
                    <td className="num" style={{color:'var(--green)',fontWeight:700}}>{p.total ? fmt(p.total)+' ကျပ်' : '—'}</td>
                    <td>{p.note || '—'}</td>
                    <td><Btn variant="red" size="sm" onClick={() => delSale(p.id)}>🗑️</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </Section>
    </div>
  )
}
