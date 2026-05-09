import React from 'react'
import s from './UI.module.css'

export const fmt = (n) => Math.round(n || 0).toLocaleString()
export const today = () => new Date().toISOString().split('T')[0]

export function Badge({ type = 'gold', children }) {
  return <span className={`${s.badge} ${s[type]}`}>{children}</span>
}

export function StatCard({ icon, value, label, color = 'gold' }) {
  return (
    <div className={`${s.statCard} ${s[color]}`}>
      <div className={s.statIcon}>{icon}</div>
      <div className={s.statVal}>{value}</div>
      <div className={s.statLbl}>{label}</div>
    </div>
  )
}

export function Section({ title, children }) {
  return (
    <div className={s.section}>
      <div className={s.sectionHead}><h3>{title}</h3></div>
      <div className={s.sectionBody}>{children}</div>
    </div>
  )
}

export function FormRow({ children }) {
  return <div className={s.formRow}>{children}</div>
}

export function FormGroup({ label, full, children }) {
  return (
    <div className={`${s.formGroup} ${full ? s.full : ''}`}>
      <label className={s.label}>{label}</label>
      {children}
    </div>
  )
}

export function Input(props) {
  return <input className={s.input} {...props} />
}

export function Select({ children, ...props }) {
  return <select className={s.input} {...props}>{children}</select>
}

export function Btn({ variant = 'gold', size, onClick, children, type = 'button' }) {
  return (
    <button
      type={type}
      className={`${s.btn} ${s[variant]} ${size ? s[size] : ''}`}
      onClick={onClick}
    >{children}</button>
  )
}

export function TotalBox({ label, formula, amount, show }) {
  if (!show) return null
  return (
    <div className={s.totalBox}>
      <div>
        <div className={s.tbLabel}>{label}</div>
        {formula && <div className={s.tbFormula}>{formula}</div>}
      </div>
      <div className={s.tbAmount}>{amount}</div>
    </div>
  )
}

export function BalancePanel({ show, total, paid, thisAmt, balance }) {
  if (!show) return null
  const bal = total - paid - thisAmt
  const col = bal <= 0 ? 'var(--green)' : 'var(--red)'
  return (
    <div className={s.balancePanel}>
      <BpRow label="📦 ကုန်ကျစရိတ် (Total)"  val={`${fmt(total)} ကျပ်`} />
      <BpRow label="✅ ပေးပြီးငွေ (ယခင်)"     val={`${fmt(paid)} ကျပ်`}  color="var(--green)" />
      <BpRow label="💵 ဤအကြိမ် ပေးငွေ"        val={`${fmt(thisAmt)} ကျပ်`} color="var(--blue)" />
      <div className={s.bpDivider} />
      <BpRow
        label="🔴 ပေးရန် ကျန်ငွေ" bold
        val={`${fmt(Math.abs(bal))} ကျပ်${bal < 0 ? ' (အပို)' : ''}`}
        color={col}
      />
    </div>
  )
}

function BpRow({ label, val, color, bold }) {
  return (
    <div className={`${s.bpRow} ${bold ? s.bpFinal : ''}`}>
      <span className={s.bpLbl}>{label}</span>
      <span className={s.bpVal} style={color ? { color } : {}}>{val}</span>
    </div>
  )
}

export function SupCard({ name, total, paid, children }) {
  const bal = Math.max(0, total - paid)
  const pct = total > 0 ? Math.min(100, Math.round(paid / total * 100)) : 0
  const col = bal <= 0 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--red)'
  const label = bal <= 0 ? '✅ ပြေပြေလည်လည်' : pct >= 50 ? '⚡ တစ်ဝက်ကျော်' : '⚠️ ကျန်ငွေများ'
  const badgeType = bal <= 0 ? 'green' : pct >= 50 ? 'blue' : 'red'
  return (
    <div className={s.supCard}>
      <div className={s.supCardTop}>
        <span className={s.supCardName}>{name}</span>
        <Badge type={badgeType}>{label}</Badge>
      </div>
      <div className={s.supCardGrid}>
        <MiniStat val={fmt(total)} lbl="ကုန်ကျ (ကျပ်)"   color="var(--gold)" />
        <MiniStat val={fmt(paid)}  lbl="ပေးပြီး (ကျပ်)"  color="var(--green)" />
        <MiniStat val={fmt(bal)}   lbl="ကျန်ငွေ (ကျပ်)"  color={col} />
      </div>
      <ProgressBar pct={pct} color={col} label={`${pct}% ပေးပြီး`} />
      {children}
    </div>
  )
}

export function MiniStat({ val, lbl, color }) {
  return (
    <div className={s.miniStat}>
      <div className={s.miniVal} style={color ? { color } : {}}>{val}</div>
      <div className={s.miniLbl}>{lbl}</div>
    </div>
  )
}

export function ProgressBar({ pct, color, label }) {
  return (
    <div>
      <div className={s.progressTrack}>
        <div className={s.progressFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      {label && <div className={s.progressLabel}>{label}</div>}
    </div>
  )
}

export function Toast({ message, show }) {
  return (
    <div className={`${s.toast} ${show ? s.toastShow : ''}`}>{message}</div>
  )
}

export function ConfirmModal({ show, onClose, onConfirm, children, title }) {
  if (!show) return null
  return (
    <div className={s.modalOverlay}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <div className={s.modalIcon}>💳</div>
          <div className={s.modalTitle}>{title}</div>
          <div className={s.modalSub}>အောက်ပါ အချက်အလက်များ မှန်ကန်မှု စစ်ဆေးပါ</div>
        </div>
        <div className={s.modalBody}>{children}</div>
        <div className={s.modalFooter}>
          <Btn variant="outline" onClick={onClose}>❌ မလုပ်တော့</Btn>
          <Btn variant="gold" onClick={onConfirm}>✅ အတည်ပြု သိမ်းမည်</Btn>
        </div>
      </div>
    </div>
  )
}
