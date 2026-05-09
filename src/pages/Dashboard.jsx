import React from 'react'
import { StatCard, Section, SupCard, MiniStat, ProgressBar, Badge, fmt } from '../components/UI.jsx'
import s from './Pages.module.css'

export default function Dashboard({ store }) {
  const { purchases, payments, getRiceTypes, getStockByType } = store
  const totalCost = purchases.reduce((a,p) => a + p.total, 0)
  const totalPaid = payments.reduce((a,p) => a + p.amount, 0)
  const totalBags = purchases.reduce((a,p) => a + p.qty, 0)
  const balance   = totalCost - totalPaid
  const types     = getRiceTypes()

  return (
    <div>
      <div className={s.statGrid}>
        <StatCard icon="🛒" value={fmt(totalCost)} label="ကုန်ကျစရိတ် (ကျပ်)" color="gold"  />
        <StatCard icon="✅" value={fmt(totalPaid)} label="ပေးပြီးငွေ (ကျပ်)"  color="green" />
        <StatCard icon="🔴" value={fmt(balance)}   label="ပေးရန်ကျန် (ကျပ်)" color="red"   />
        <StatCard icon="📦" value={fmt(totalBags)} label="ဝယ်ယူမှု (အိတ်)"   color="blue"  />
      </div>

      {/* Payment by type */}
      <Section title="💳 ဆန်အမျိုးအစားအလိုက် ငွေပေးချေမှု">
        {!types.length ? <p className="no-data">ဝယ်ယူမှု မရှိသေးပါ</p> :
          types.map(type => {
            const rows      = purchases.filter(p => p.type === type)
            const typeCost  = rows.reduce((a,p) => a + p.total, 0)
            const typePaid  = payments.filter(p => p.type === type).reduce((a,p) => a + p.amount, 0)
            const remain    = Math.max(0, typeCost - typePaid)
            const pct       = typeCost > 0 ? Math.min(100, Math.round(typePaid/typeCost*100)) : 0
            const col       = remain <= 0 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--red)'
            const badgeType = remain <= 0 ? 'green' : pct >= 50 ? 'blue' : 'red'
            const label     = remain <= 0 ? '✅ ပြေပြေလည်လည်' : pct >= 50 ? '⚡ တစ်ဝက်ကျော်' : '⚠️ ပေးရန်ကျန်'
            const qty       = rows.reduce((a,p) => a + p.qty, 0)
            return (
              <div key={type} className={s.supCard}>
                <div className={s.supCardTop}>
                  <span className={s.supCardName}>🌾 {type}</span>
                  <Badge type={badgeType}>{label}</Badge>
                </div>
                <div className={s.miniGrid}>
                  <MiniStat val={fmt(typeCost)} lbl="ကုန်ကျ (ကျပ်)"  color="var(--gold)"  />
                  <MiniStat val={fmt(typePaid)} lbl="ပေးပြီး (ကျပ်)" color="var(--green)" />
                  <MiniStat val={fmt(remain)}   lbl="ကျန်ငွေ (ကျပ်)" color={col}         />
                </div>
                <ProgressBar pct={pct} color={col} label={`${fmt(qty)} အိတ် · ${pct}% ပေးပြီး`} />
              </div>
            )
          })
        }
      </Section>

      {/* Stock */}
      <Section title="📦 Stock အခြေအနေ">
        {!types.length ? <p className="no-data">ဝယ်ယူမှု မရှိသေးပါ</p> :
          types.map(type => {
            const { bought, sold, remaining } = getStockByType(type)
            const pct   = bought > 0 ? Math.min(100, Math.round(remaining/bought*100)) : 0
            const col   = remaining <= 0 ? 'var(--red)' : pct < 20 ? 'var(--gold)' : 'var(--green)'
            const bt    = remaining <= 0 ? 'red' : pct < 20 ? 'gold' : 'green'
            const lbl   = remaining <= 0 ? '🔴 Stock မရှိ' : pct < 20 ? '🟡 Stock နည်း' : '🟢 ပုံမှန်'
            return (
              <div key={type} className={s.supCard}>
                <div className={s.supCardTop}>
                  <span className={s.supCardName}>🌾 {type}</span>
                  <Badge type={bt}>{lbl}</Badge>
                </div>
                <div className={s.miniGrid}>
                  <MiniStat val={fmt(bought)}    lbl="ဝယ်ယူ (အိတ်)"  color="var(--blue)"  />
                  <MiniStat val={fmt(sold)}      lbl="ရောင်းချ (အိတ်)" color="var(--gold)"  />
                  <MiniStat val={fmt(remaining)} lbl="လက်ကျန် (အိတ်)" color={col}          />
                </div>
                <ProgressBar pct={pct} color={col} label={`${pct}% ကျန်`} />
              </div>
            )
          })
        }
      </Section>

      {/* Recent purchases */}
      <Section title="🛒 နောက်ဆုံး ဝယ်ယူမှုများ">
        {!purchases.length ? <p className="no-data">မှတ်တမ်း မရှိသေးပါ</p> :
          purchases.slice(0,5).map(p => (
            <div key={p.id} className={s.recentRow}>
              <div>
                <div className={s.recentMain}>
                  {p.supplier} <Badge type="gold">{p.type}</Badge>
                </div>
                <div className={s.recentSub}>📅 {p.date} · 📦 {fmt(p.qty)} အိတ်</div>
              </div>
              <div className={s.recentAmt}>{fmt(p.total)} ကျပ်</div>
            </div>
          ))
        }
      </Section>
    </div>
  )
}
