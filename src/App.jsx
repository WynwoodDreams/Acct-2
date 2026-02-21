import { useState, useEffect, useCallback } from 'react'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './components/Dashboard'
import CommitmentForm from './components/CommitmentForm'

const STORAGE_KEYS = {
  profile: 'kept_profile',
  commitments: 'kept_commitments',
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [profile, setProfile] = useState(() => loadJSON(STORAGE_KEYS.profile, null))
  const [commitments, setCommitments] = useState(() => loadJSON(STORAGE_KEYS.commitments, []))
  const [view, setView] = useState(profile ? 'dashboard' : 'profile')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (profile) localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.commitments, JSON.stringify(commitments))
  }, [commitments])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Check for due commitments every minute
  useEffect(() => {
    function checkDue() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return
      const now = new Date()
      const today = now.toISOString().slice(0, 10)
      const currentHour = now.getHours()
      const currentMin = now.getMinutes()

      commitments.forEach((c) => {
        if (!isDueToday(c, today)) return
        // Notify at 9 AM if not yet completed today
        if (currentHour === 9 && currentMin === 0 && !c.history[today]) {
          new Notification('Kept Reminder', { body: `Time to follow through: ${c.title}` })
        }
      })
    }
    const interval = setInterval(checkDue, 60000)
    return () => clearInterval(interval)
  }, [commitments])

  const saveProfile = useCallback((p) => {
    setProfile(p)
    setView('dashboard')
  }, [])

  const addCommitment = useCallback((c) => {
    setCommitments((prev) => [...prev, { ...c, id: crypto.randomUUID(), history: {}, createdAt: new Date().toISOString() }])
    setView('dashboard')
  }, [])

  const updateCommitment = useCallback((updated) => {
    setCommitments((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
    setEditingId(null)
    setView('dashboard')
  }, [])

  const deleteCommitment = useCallback((id) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const markCommitment = useCallback((id, date, status) => {
    setCommitments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, history: { ...c.history, [date]: status } } : c
      )
    )
  }, [])

  const handleEdit = useCallback((id) => {
    setEditingId(id)
    setView('form')
  }, [])

  const editingCommitment = editingId ? commitments.find((c) => c.id === editingId) : null

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={() => profile && setView('dashboard')}>Kept</h1>
        {profile && view !== 'profile' && (
          <nav>
            <button className={view === 'dashboard' ? 'active' : ''} onClick={() => { setEditingId(null); setView('dashboard') }}>Dashboard</button>
            <button className={view === 'form' && !editingId ? 'active' : ''} onClick={() => { setEditingId(null); setView('form') }}>+ New</button>
            <button onClick={() => setView('profile')}>Profile</button>
          </nav>
        )}
      </header>

      <main>
        {view === 'profile' && (
          <ProfileSetup profile={profile} onSave={saveProfile} />
        )}
        {view === 'dashboard' && (
          <Dashboard
            commitments={commitments}
            profile={profile}
            onMark={markCommitment}
            onEdit={handleEdit}
            onDelete={deleteCommitment}
            onAdd={() => { setEditingId(null); setView('form') }}
          />
        )}
        {view === 'form' && (
          <CommitmentForm
            commitment={editingCommitment}
            onSave={editingId ? updateCommitment : addCommitment}
            onCancel={() => { setEditingId(null); setView('dashboard') }}
          />
        )}
      </main>
    </div>
  )
}

export function isDueToday(commitment, dateStr) {
  const { schedule } = commitment
  if (!schedule) return true
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDay() // 0=Sun..6=Sat

  switch (schedule.type) {
    case 'daily':
      return true
    case 'weekdays':
      return day >= 1 && day <= 5
    case 'custom':
      return (schedule.days || []).includes(day)
    case 'specific':
      return schedule.date === dateStr
    case 'once':
      return schedule.date === dateStr
    default:
      return true
  }
}

export function getFollowThroughRate(commitment) {
  const entries = Object.values(commitment.history || {})
  if (entries.length === 0) return null
  const done = entries.filter((s) => s === 'done').length
  return Math.round((done / entries.length) * 100)
}
