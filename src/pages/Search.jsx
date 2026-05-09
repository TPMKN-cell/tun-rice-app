import React, { useState } from 'react'
import { Section, FormRow, FormGroup, Select, StatCard, Badge, fmt } from '../components/UI.jsx'
import s from './Pages.module.css'

export default function Search({ store }) {
  const { purchases, payments, getRiceTypes, getSuppliers } = store
  const [type, setType]     = useState('')
  const [supplier, setSup]  = useState('')

  const types     = getRiceTypes()
  const suppliers = getSuppliers()

  const rows = purchases.filter(p =>
    (!type     || p.type === type) &&
    (!supplier || p.supplier === supplier)
  )

  const totalQty  = rows.reduce((a,p) => a + p.qty, 0)
  const totalCost = rows.reduce((a,p) => a + p.total, 0)
  const avgPrice  = totalQty > 0 ? totalCost / totalQty : 0
  const lastRow   = rows[0]
  const lastPrice = lastRow ? lastRow.price + lastRow.transport : 0
  const suppCount = new Set(rows.map(p => p.supplier)).size

  // Payment scoped to selected type
  const typePaid = type
    ? payments.filter(p => p.type === type && (!supplier || p.supplier === supplier)).reduce((a,p) => a + p.amount, 0)
    : 0
  const remain = Math.max(0, totalCost - typePaid)

  return (
    <div>
      <Section title="🔍 ဆန်အမျိုးအစားဖြင့် ရှာဖွေရန်">
        <FormRow>
          <FormGroup label="🌾 ဆန်အမျိုးအစား" full>
            <Select value={type} onChange={e => setType(e.target.value)}>
              <option value="">— ဆန်အမျိုးအစား ရွေးပါ —</option>
              {types.map(t => <option key={t}>{t}</option>)}
            </Select>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="🏭 Supplier (ရွေးချယ်နိုင်)" full>
            <Select value={supplier} onChange={e => setSup(e.target.value)}>
              <option value="">Supplier အားလုံး</option>
              {suppliers.map(s => <option key={s}>{s}</option>)}
            </Select>
          </FormGroup>
        </FormRow>

        {type && (
          <>
            <div className={s.statGrid} style={{marginTop:16}}>
              <StatCard icon="📦" value={fmt(totalQty)}  label="စုစုပေါင်းအိတ်" color="gold"  />
              <StatCard icon="💵" value={fmt(totalCost)} label="ကုန်ကျ (ကျပ်)"  color="blue"  />
              <StatCard icon="📊" value={fmt(avgPrice)}  label="ပျမ်းမျှဝယ်ဈေး" color="green" />
              <StatCard icon="🏷️" value={fmt(lastPrice)} label="နောက်ဆုံးဈေး"   color="gold"  />
              <StatCard icon="🏭" value={suppCount}      label="Supplier အရေ"   color="blue"  />
              <StatCard icon="🔴" value={fmt(remain)}    label="ပေးရန်ကျန် (ကျပ်)" color="red" />
            </div>

            <div className={s.tableWrap} style={{marginTop:16}}>
              {!rows.length ? <p className="no-data">မှတ်တမ်း မရှိပါ</p> :
                <table>
                  <thead><tr><th>ရက်စွဲ</th><th>စက်ရုံ</th><th>အိတ်</th><th>တစ်အိတ်ဈေး</th><th>ကားခ</th><th>ကားခအမျိုး</th><th>ကုန်ကျ</th></tr></thead>
                  <tbody>
                    {rows.map(p => (
                      <tr key={p.id}>
                        <td>{p.date}</td>
                        <td>{p.supplier}</td>
                        <td className="num">{fmt(p.qty)} အိတ်</td>
                        <td className="num">{fmt(p.price)} ကျပ်</td>
                        <td className="num">{fmt(p.transport)} ကျပ်</td>
                        <td><Badge type="blue">{p.ttype}</Badge></td>
                        <td className="num" style={{color:'var(--gold)'}}>{fmt(p.total)} ကျပ်</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          </>
        )}
        {!type && <p className="no-data" style={{marginTop:20}}>ဆန်အမျိုးအစား ရွေးချယ်ပါ</p>}
      </Section>
    </div>
  )
}
