import React, { useState, useMemo } from 'react'
import { Section, FormRow, FormGroup, Select, Input, Btn, Badge, ConfirmModal, fmt, today } from '../components/UI.jsx'
import { PAY_CATS } from '../store/useStore.js'
import s from './Pages.module.css'

const CAT_COLOR = { 'ဆန်ဖိုး': 'var(--gold)', 'ကားခ': 'var(--blue)', 'စရံ': 'var(--green)' }
const CAT_ICON  = { 'ဆန်ဖိုး': '🌾', 'ကားခ': '🚛', 'စရံ': '💰' }

export default function Payment({ store, toast }) {
  const {
    purchases, payments, getSuppliers,
    getTotalForScope, getPaidForScope,
    getPaidByCategoryForScope, getDepositForScope,
    getTransportTotalForScope, getRiceCostForScope,
    addPayment, delPayment
  } = store

  const [date, setDate]             = useState(today())
  const [supplier, setSupplier]     = useState('')
  const [riceType, setRiceType]     = useState('')
  const [category, setCategory]     = useState('ဆန်ဖိုး')
  const [amount, setAmount]         = useState('')
  const [method, setMethod]         = useState('Cash')
  const [depositFor, setDepositFor] = useState('ဆန်ဖိုး')
  const [confirm, setConfirm]       = useState(null)

  const suppliers = getSuppliers()

  const supplierTypes = useMemo(() => {
    if (!supplier) return []
    return [...new Set(purchases.filter(p => p.supplier === supplier).map(p => p.type))]
  }, [supplier, purchases])

  const handleSupplierChange = (e) => {
    setSupplier(e.target.value); setRiceType(''); setAmount('')
  }

  const thisAmt      = parseFloat(amount) || 0
  const scope        = riceType || null
  const orderTotal   = supplier ? getTotalForScope(supplier, scope)          : 0
  const alreadyPaid  = supplier ? getPaidForScope(supplier, scope)           : 0
  const catPaid      = supplier ? getPaidByCategoryForScope(supplier, scope) : {}
  const deposit      = supplier ? getDepositForScope(supplier, scope)        : 0
  const remaining    = orderTotal - alreadyPaid
  const transportOwed = supplier ? getTransportTotalForScope(supplier, scope) : 0
  const riceOwed      = supplier ? getRiceCostForScope(supplier, scope)       : 0
  const ricePaidSoFar  = catPaid['ဆန်ဖိုး'] || 0
  const transPaidSoFar = catPaid['ကားခ']     || 0
  const riceRemain     = Math.max(0, riceOwed     - ricePaidSoFar)
  const transRemain    = Math.max(0, transportOwed - transPaidSoFar)
  const afterBal       = category === 'စရံ' ? remaining : remaining - thisAmt

  const handleSave = () => {
    if (!date || !supplier || !thisAmt || thisAmt <= 0) {
      toast('⚠️ လိုအပ်သောအချက်များ ဖြည့်ပါ'); return
    }
    setConfirm({
      date, supplier, type: riceType, category,
      depositFor: category === 'စရံ' ? depositFor : null,
      amount: thisAmt, method,
      orderTotal, alreadyPaid, afterBal,
      riceOwed, transportOwed
    })
  }

  const commitPayment = () => {
    addPayment({
      date: confirm.date, supplier: confirm.supplier, type: confirm.type,
      category: confirm.category, depositFor: confirm.depositFor,
      amount: confirm.amount, method: confirm.method
    })
    setConfirm(null)
    setDate(today()); setSupplier(''); setRiceType('')
    setCategory('ဆန်ဖိုး'); setAmount(''); setMethod('Cash')
    toast('✅ ပေးချေမှု သိမ်းဆည်းပြီးပါပြီ')
  }

  return (
    <div>
      <Section title="💵 ငွေပေးချေမှု ထည့်ရန်">
        <FormRow>
          <FormGroup label="📅 ရက်စွဲ *">
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </FormGroup>
          <FormGroup label="🏭 Supplier *">
            <Select value={supplier} onChange={handleSupplierChange}>
              <option value="">— Supplier ရွေးပါ —</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="🌾 ဆန်အမျိုးအစား">
            <Select value={riceType} onChange={e => { setRiceType(e.target.value); setAmount('') }} disabled={!supplier}>
              <option value="">{supplier ? '— အမျိုးအစားအားလုံး —' : '— Supplier ဦးစွာရွေးပါ —'}</option>
              {supplierTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="🏷️ ငွေကြေးအမျိုးအစား *">
            <Select value={category} onChange={e => { setCategory(e.target.value); setAmount('') }} disabled={!supplier}>
              {PAY_CATS.map(c => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
            </Select>
          </FormGroup>
        </FormRow>

        {/* စရံ — ask which category it covers */}
        {category === 'စရံ' && supplier && (
          <FormRow>
            <FormGroup label="💰 စရံ သည် ဘယ်အတွက်ဆိုင်သနည်း *" full>
              <Select value={depositFor} onChange={e => setDepositFor(e.target.value)}>
                <option value="ဆန်ဖိုး">🌾 ဆန်ဖိုး အတွက် စရံ</option>
                <option value="ကားခ">🚛 ကားခ အတွက် စရံ</option>
              </Select>
            </FormGroup>
          </FormRow>
        )}

        <FormRow>
          <FormGroup label="💵 ပေးမည့်ငွေ (ကျပ်) *">
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="ကျပ် ထည့်ပါ" disabled={!supplier} />
          </FormGroup>
          <FormGroup label="💳 ငွေပေးနည်း">
            <Select value={method} onChange={e => setMethod(e.target.value)}>
              <option>Cash</option><option>KPay / Wave</option><option>Check</option><option>အခြား</option>
            </Select>
          </FormGroup>
        </FormRow>

        {/* Per-category breakdown panel */}
        {supplier && (
          <div className={s.balanceBreakdown}>
            <div className={s.bbTitle}>📊 ငွေကြေး အသေးစိတ်</div>
            <div className={s.bbRow}>
              <span className={s.bbLbl}>💵 ကုန်ကျ (Total)</span>
              <span style={{color:'var(--gold)',fontWeight:600}}>{fmt(orderTotal)} ကျပ်</span>
            </div>
            {/* ဆန်ဖိုး */}
            <div className={s.bbCatRow}>
              <div className={s.bbCatHeader}>
                <span>🌾 ဆန်ဖိုး</span>
                <span style={{color:'var(--gold)',fontSize:12}}>{fmt(riceOwed)} ကျပ်</span>
              </div>
              <div className={s.bbCatDetail}>
                <span>ပေးပြီး: <strong style={{color:'var(--green)'}}>{fmt(ricePaidSoFar)} ကျပ်</strong></span>
                <span>ကျန်: <strong style={{color: riceRemain<=0?'var(--green)':'var(--red)'}}>{fmt(riceRemain)} ကျပ်</strong></span>
              </div>
            </div>
            {/* ကားခ */}
            {transportOwed > 0 && (
              <div className={s.bbCatRow}>
                <div className={s.bbCatHeader}>
                  <span>🚛 ကားခ</span>
                  <span style={{color:'var(--blue)',fontSize:12}}>{fmt(transportOwed)} ကျပ်</span>
                </div>
                <div className={s.bbCatDetail}>
                  <span>ပေးပြီး: <strong style={{color:'var(--green)'}}>{fmt(transPaidSoFar)} ကျပ်</strong></span>
                  <span>ကျန်: <strong style={{color: transRemain<=0?'var(--green)':'var(--blue)'}}>{fmt(transRemain)} ကျပ်</strong></span>
                </div>
              </div>
            )}
            {deposit > 0 && (
              <div className={s.bbRow} style={{borderTop:'1px dashed var(--border)',marginTop:6,paddingTop:8}}>
                <span className={s.bbLbl}>💰 စရံ (သီးခြား)</span>
                <span style={{color:'var(--green)',fontWeight:600}}>{fmt(deposit)} ကျပ်</span>
              </div>
            )}
            <div className={s.bbDivider}/>
            <div className={s.bbRow}>
              <span className={s.bbLbl} style={{fontWeight:700,color:'var(--text)'}}>🔴 ကျန်ငွေ စုစုပေါင်း</span>
              <span style={{color: remaining<=0?'var(--green)':'var(--red)', fontWeight:700, fontSize:15}}>{fmt(remaining)} ကျပ်</span>
            </div>
            {thisAmt > 0 && category !== 'စရံ' && (
              <div className={s.bbPreview}>
                <span>ဤအကြိမ် ({CAT_ICON[category]} {category}) ပေးပြီးနောက်</span>
                <span style={{color: afterBal<=0?'var(--green)':'var(--red)', fontWeight:700}}>{fmt(Math.max(0,afterBal))} ကျပ် ကျန်</span>
              </div>
            )}
            {thisAmt > 0 && category === 'စရံ' && (
              <div className={s.depositNote}>💰 {fmt(thisAmt)} ကျပ် — {depositFor} အတွက် စရံ<br/>ကုန်ကျစရိတ် ကျန်ငွေ ထဲ မပါ (သီးခြား)</div>
            )}
          </div>
        )}

        <div className={s.formBtns}>
          <Btn variant="outline" onClick={() => { setSupplier(''); setRiceType(''); setAmount(''); setDate(today()) }}>🔄 ဖျက်</Btn>
          <Btn variant="gold" onClick={handleSave}>💾 သိမ်းမည်</Btn>
        </div>
      </Section>

      {/* Supplier balance cards */}
      <Section title="🏭 Supplier အလိုက် ငွေကြေး အခြေအနေ">
        {!suppliers.length ? <p className="no-data">Supplier မရှိသေးပါ</p> :
          suppliers.map(sup => {
            const total       = getTotalForScope(sup, null)
            const paid        = getPaidForScope(sup, null)
            const dep         = getDepositForScope(sup, null)
            const cats        = getPaidByCategoryForScope(sup, null)
            const tOwed       = getTransportTotalForScope(sup, null)
            const rOwed       = getRiceCostForScope(sup, null)
            const bal         = Math.max(0, total - paid)
            const pct         = total > 0 ? Math.min(100, Math.round(paid/total*100)) : 0
            const col         = bal<=0?'var(--green)':pct>=50?'var(--blue)':'var(--red)'
            const bt          = bal<=0?'green':pct>=50?'blue':'red'
            const rPaid       = cats['ဆန်ဖိုး']||0
            const tPaid       = cats['ကားခ']||0
            const rRem        = Math.max(0, rOwed - rPaid)
            const tRem        = Math.max(0, tOwed - tPaid)
            return (
              <div key={sup} className={s.supCard}>
                <div className={s.supCardTop}>
                  <span className={s.supCardName}>🏭 {sup}</span>
                  <Badge type={bt}>{bal<=0?'✅ ပြေပြေလည်လည်':pct>=50?'⚡ တစ်ဝက်ကျော်':'⚠️ ကျန်ငွေများ'}</Badge>
                </div>
                <div className={s.miniGrid}>
                  <div className={s.mini}><div style={{color:'var(--gold)',fontWeight:700}}>{fmt(total)}</div><div className={s.miniLbl}>ကုန်ကျ (ကျပ်)</div></div>
                  <div className={s.mini}><div style={{color:'var(--green)',fontWeight:700}}>{fmt(paid)}</div><div className={s.miniLbl}>ပေးပြီး (ကျပ်)</div></div>
                  <div className={s.mini}><div style={{color:col,fontWeight:700}}>{fmt(bal)}</div><div className={s.miniLbl}>ကျန်ငွေ (ကျပ်)</div></div>
                </div>
                <div className={s.catBreakdown}>
                  <div className={s.catRow}><span>🌾 ဆန်ဖိုး ကျသင့်</span><span style={{color:'var(--gold)'}}>{fmt(rOwed)} ကျပ်</span></div>
                  <div className={s.catRow}><span>🌾 ဆန်ဖိုး ပေးပြီး</span><span style={{color:'var(--green)'}}>{fmt(rPaid)} ကျပ်</span></div>
                  <div className={s.catRow}><span>🌾 ဆန်ဖိုး ကျန်</span><span style={{color:rRem<=0?'var(--green)':'var(--red)',fontWeight:600}}>{fmt(rRem)} ကျပ်</span></div>
                  {tOwed > 0 && <>
                    <div className={s.catRow} style={{borderTop:'1px dashed var(--border)',marginTop:4,paddingTop:6}}>
                      <span>🚛 ကားခ ကျသင့်</span><span style={{color:'var(--blue)'}}>{fmt(tOwed)} ကျပ်</span>
                    </div>
                    <div className={s.catRow}><span>🚛 ကားခ ပေးပြီး</span><span style={{color:'var(--green)'}}>{fmt(tPaid)} ကျပ်</span></div>
                    <div className={s.catRow}><span>🚛 ကားခ ကျန်</span><span style={{color:tRem<=0?'var(--green)':'var(--blue)',fontWeight:600}}>{fmt(tRem)} ကျပ်</span></div>
                  </>}
                  {dep > 0 && (
                    <div className={s.catRow} style={{borderTop:'1px dashed var(--border)',marginTop:4,paddingTop:6}}>
                      <span>💰 စရံ (သီးခြား)</span>
                      <span style={{color:'var(--green)',fontWeight:600}}>{fmt(dep)} ကျပ်</span>
                    </div>
                  )}
                </div>
                <div className={s.progressTrack}><div className={s.progressFill} style={{width:`${pct}%`,background:col}}/></div>
                <div className={s.pctLabel}>{pct}% ပေးပြီး</div>
              </div>
            )
          })
        }
      </Section>

      {/* Payment history */}
      <Section title="📋 ငွေပေးချေမှု မှတ်တမ်းများ">
        {!payments.length ? <p className="no-data">မှတ်တမ်း မရှိသေးပါ</p> :
          <div className={s.tableWrap}>
            <table>
              <thead><tr><th>ရက်စွဲ</th><th>စက်ရုံ</th><th>ဆန်အမျိုး</th><th>ငွေကြေးအမျိုး</th><th>ပေးငွေ</th><th>ငွေပေးနည်း</th><th></th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.date}</td><td>{p.supplier}</td>
                    <td>{p.type ? <Badge type="gold">{p.type}</Badge> : '—'}</td>
                    <td><span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,background:p.category==='ဆန်ဖိုး'?'var(--gold-dim)':p.category==='ကားခ'?'var(--blue-dim)':'var(--green-dim)',color:CAT_COLOR[p.category]||'var(--text2)'}}>
                      {CAT_ICON[p.category]} {p.category}{p.depositFor?` (${p.depositFor})`:''}
                    </span></td>
                    <td className="num" style={{color:p.category==='စရံ'?'var(--green)':'var(--gold)'}}>{fmt(p.amount)} ကျပ်</td>
                    <td><Badge type="blue">{p.method}</Badge></td>
                    <td><Btn variant="red" size="sm" onClick={() => delPayment(p.id)}>🗑️</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </Section>

      <ConfirmModal show={!!confirm} title="ငွေပေးချေမှု အတည်ပြုရန်" onClose={() => setConfirm(null)} onConfirm={commitPayment}>
        {confirm && (
          <div className={s.confirmBody}>
            <div className={s.confirmHeader}>
              <div>
                <div className={s.confirmName}>🏭 {confirm.supplier}</div>
                <div className={s.confirmSub}>{confirm.type ? `🌾 ${confirm.type}` : 'ဆန်အမျိုးအစားအားလုံး'} · 📅 {confirm.date}</div>
              </div>
            </div>
            <div className={s.confirmRows}>
              <div className={s.confirmRow}><span>ကုန်ကျ (Total)</span><span style={{color:'var(--gold)',fontWeight:600}}>{fmt(confirm.orderTotal)} ကျပ်</span></div>
              <div className={s.confirmRow}><span>🌾 ဆန်ဖိုး ကျသင့်</span><span style={{color:'var(--gold)'}}>{fmt(confirm.riceOwed)} ကျပ်</span></div>
              <div className={s.confirmRow}><span>🚛 ကားခ ကျသင့်</span><span style={{color:'var(--blue)'}}>{fmt(confirm.transportOwed)} ကျပ်</span></div>
              <div className={s.confirmRow}><span>ပေးပြီးငွေ (ယခင်)</span><span style={{color:'var(--green)',fontWeight:600}}>{fmt(confirm.alreadyPaid)} ကျပ်</span></div>
              <div className={`${s.confirmRow} ${s.confirmHighlight}`}>
                <span>{CAT_ICON[confirm.category]} {confirm.category}{confirm.depositFor ? ` — ${confirm.depositFor} အတွက် စရံ` : ' — ဤအကြိမ်'}</span>
                <span style={{color:CAT_COLOR[confirm.category],fontWeight:700,fontSize:15}}>{fmt(confirm.amount)} ကျပ်</span>
              </div>
            </div>
            {confirm.category === 'စရံ'
              ? <div className={s.confirmBalance} style={{color:'var(--green)'}}>💰 {confirm.depositFor} အတွက် စရံ — သီးခြား Track မည်</div>
              : <div className={s.confirmBalance} style={{color:confirm.afterBal<=0?'var(--green)':'var(--red)'}}>
                  {confirm.afterBal<=0 ? `✅ ပြေပြေလည်လည် (${fmt(Math.abs(confirm.afterBal))} ကျပ် အပို)` : `🔴 ${fmt(confirm.afterBal)} ကျပ် ကျန်သေးသည်`}
                </div>
            }
            <div className={s.confirmMethod}>💳 {confirm.method}</div>
          </div>
        )}
      </ConfirmModal>
    </div>
  )
}
