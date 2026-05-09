import { useState, useEffect, useCallback } from 'react'
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase.js'

export const PAY_CATS = ['ဆန်ဖိုး', 'ကားခ', 'စရံ']

export function useStore() {
  const [purchases, setPurchases] = useState([])
  const [payments,  setPayments]  = useState([])
  const [sales,     setSales]     = useState([])
  const [loading,   setLoading]   = useState(true)

  // ── Real-time listeners ──────────────────────────────────────────
  useEffect(() => {
    let loaded = { purchases: false, payments: false, sales: false }
    const checkDone = () => {
      if (loaded.purchases && loaded.payments && loaded.sales) setLoading(false)
    }

    const unsubP = onSnapshot(
      query(collection(db, 'purchases'), orderBy('createdAt', 'desc')),
      snap => {
        setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        loaded.purchases = true; checkDone()
      }
    )
    const unsubPay = onSnapshot(
      query(collection(db, 'payments'), orderBy('createdAt', 'desc')),
      snap => {
        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        loaded.payments = true; checkDone()
      }
    )
    const unsubS = onSnapshot(
      query(collection(db, 'sales'), orderBy('createdAt', 'desc')),
      snap => {
        setSales(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        loaded.sales = true; checkDone()
      }
    )

    return () => { unsubP(); unsubPay(); unsubS() }
  }, [])

  // ── CRUD ─────────────────────────────────────────────────────────
  const addPurchase = useCallback(async (rec) => {
    await addDoc(collection(db, 'purchases'), { ...rec, createdAt: serverTimestamp() })
  }, [])
  const delPurchase = useCallback(async (id) => {
    await deleteDoc(doc(db, 'purchases', id))
  }, [])

  const addPayment = useCallback(async (rec) => {
    await addDoc(collection(db, 'payments'), { ...rec, createdAt: serverTimestamp() })
  }, [])
  const delPayment = useCallback(async (id) => {
    await deleteDoc(doc(db, 'payments', id))
  }, [])

  const addSale = useCallback(async (rec) => {
    await addDoc(collection(db, 'sales'), { ...rec, createdAt: serverTimestamp() })
  }, [])
  const delSale = useCallback(async (id) => {
    await deleteDoc(doc(db, 'sales', id))
  }, [])

  // ── Derived helpers ───────────────────────────────────────────────
  const getRiceTypes = () => [...new Set(purchases.map(p => p.type))].filter(Boolean).sort()
  const getSuppliers = () => [...new Set(purchases.map(p => p.supplier))].filter(Boolean).sort()

  const getStockByType = (type) => {
    const bought = purchases.filter(p => p.type === type).reduce((s,p) => s + p.qty, 0)
    const sold   = sales.filter(s => s.type === type).reduce((s,p) => s + p.qty, 0)
    return { bought, sold, remaining: bought - sold }
  }

  const getTotalForScope = (supplier, riceType) => {
    const rows = riceType
      ? purchases.filter(p => p.supplier === supplier && p.type === riceType)
      : purchases.filter(p => p.supplier === supplier)
    return rows.reduce((s,p) => s + p.total, 0)
  }

  const getPaidForScope = (supplier, riceType) => {
    const rows = riceType
      ? payments.filter(p => p.supplier === supplier && p.type === riceType && p.category !== 'စရံ')
      : payments.filter(p => p.supplier === supplier && p.category !== 'စရံ')
    return rows.reduce((s,p) => s + p.amount, 0)
  }

  const getPaidByCategoryForScope = (supplier, riceType) => {
    const rows = riceType
      ? payments.filter(p => p.supplier === supplier && p.type === riceType)
      : payments.filter(p => p.supplier === supplier)
    return PAY_CATS.reduce((acc, cat) => {
      acc[cat] = rows.filter(p => p.category === cat).reduce((s,p) => s + p.amount, 0)
      return acc
    }, {})
  }

  const getDepositForScope = (supplier, riceType) => {
    const rows = riceType
      ? payments.filter(p => p.supplier === supplier && p.type === riceType && p.category === 'စရံ')
      : payments.filter(p => p.supplier === supplier && p.category === 'စရံ')
    return rows.reduce((s,p) => s + p.amount, 0)
  }

  const getTransportTotalForScope = (supplier, riceType) => {
    const rows = riceType
      ? purchases.filter(p => p.supplier === supplier && p.type === riceType)
      : purchases.filter(p => p.supplier === supplier)
    return rows.reduce((s,p) => s + (p.transportTotal || 0), 0)
  }

  const getRiceCostForScope = (supplier, riceType) => {
    const rows = riceType
      ? purchases.filter(p => p.supplier === supplier && p.type === riceType)
      : purchases.filter(p => p.supplier === supplier)
    return rows.reduce((s,p) => s + (p.total - (p.transportTotal || 0)), 0)
  }

  return {
    purchases, payments, sales, loading,
    getRiceTypes, getSuppliers, getStockByType,
    getTotalForScope, getPaidForScope,
    getPaidByCategoryForScope, getDepositForScope,
    getTransportTotalForScope, getRiceCostForScope,
    addPurchase, delPurchase,
    addPayment,  delPayment,
    addSale,     delSale,
  }
}
