import { useMemo } from 'react'
import CommitmentCard from './CommitmentCard'
import { isDueToday } from '../App'

const SUGGESTIONS = [
  'Read for 20 minutes before bed',
  'Walk 10,000 steps',
  'Write in a gratitude journal',
  'No phone for the first hour after waking',
  'Prepare meals for the next day',
  'Practice a skill for 30 minutes',
  'Reach out to a friend or family member',
  'Review your finances for 10 minutes',
  'Stretch or do yoga for 15 minutes',
  'Write down 3 priorities for tomorrow',
]

export default function Dashboard({ commitments, profile, onMark, onEdit, onDelete, onAdd }) {
  const today = new Date().toISOString().slice(0, 10)

  const { due, upcoming } = useMemo(() => {
    const d = []
    const u = []
    commitments.forEach((c) => {
      if (isDueToday(c, today)) d.push(c)
      else u.push(c)
    })
    return { due: d, upcoming: u }
  }, [commitments, today])

  const personalizedSuggestions = useMemo(() => {
    const areas = (profile?.improvementAreas || []).map((a) => a.toLowerCase())
    // Filter suggestions relevant to profile, fallback to random picks
    let relevant = SUGGESTIONS.filter((s) =>
      areas.some((a) => s.toLowerCase().includes(a))
    )
    if (relevant.length < 3) {
      const shuffled = [...SUGGESTIONS].sort(() => Math.random() - 0.5)
      relevant = shuffled.slice(0, 3)
    }
    return relevant.slice(0, 3)
  }, [profile])

  if (commitments.length === 0) {
    return (
      <div>
        <div className="card dashboard-empty">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>~</div>
          <p>No commitments yet.<br />Start by adding something you want to follow through on.</p>
          <button className="btn btn-primary" onClick={onAdd}>Add Your First Commitment</button>
        </div>

        {profile && (
          <div className="card suggestions-card">
            <h3>Suggestions for You</h3>
            {personalizedSuggestions.map((s) => (
              <div key={s} className="suggestion-item">
                <span>{s}</span>
                <button className="btn btn-secondary btn-sm" onClick={onAdd}>+ Add</button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {due.length > 0 && (
        <>
          <div className="section-title">Due Today</div>
          {due.map((c) => (
            <CommitmentCard
              key={c.id}
              commitment={c}
              today={today}
              onMark={onMark}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <div className="section-title">Upcoming</div>
          {upcoming.map((c) => (
            <CommitmentCard
              key={c.id}
              commitment={c}
              today={today}
              onMark={onMark}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </>
      )}

      {profile && (
        <div className="card suggestions-card" style={{ marginTop: '1rem' }}>
          <h3>Suggestions for You</h3>
          {personalizedSuggestions.map((s) => (
            <div key={s} className="suggestion-item">
              <span>{s}</span>
              <button className="btn btn-secondary btn-sm" onClick={onAdd}>+ Add</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
