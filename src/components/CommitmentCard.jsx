import { useMemo } from 'react'
import { getFollowThroughRate } from '../App'

function getLast7Days(today) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

const SHORT_DAY = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CommitmentCard({ commitment, today, onMark, onEdit, onDelete }) {
  const last7 = useMemo(() => getLast7Days(today), [today])
  const rate = getFollowThroughRate(commitment)
  const todayStatus = commitment.history[today]

  const rateClass = rate === null ? '' : rate >= 70 ? 'rate-good' : rate >= 40 ? 'rate-ok' : 'rate-low'

  const scheduleLabel = useMemo(() => {
    const s = commitment.schedule
    if (!s) return 'Always'
    switch (s.type) {
      case 'daily': return 'Daily'
      case 'weekdays': return 'Weekdays'
      case 'custom': return (s.days || []).map((d) => SHORT_DAY[d]).join(', ')
      case 'specific': return s.date || 'Specific date'
      case 'once': return s.date ? `Once on ${s.date}` : 'One time'
      default: return ''
    }
  }, [commitment.schedule])

  return (
    <div className="commitment-card">
      <div className="card-top">
        <div>
          <h3>{commitment.title}</h3>
          {commitment.description && <p className="card-desc">{commitment.description}</p>}
        </div>
      </div>

      <div className="card-meta">
        <span>{scheduleLabel}</span>
        {commitment.deadline && <span>Due {commitment.deadline}</span>}
        {rate !== null && <span className={`rate ${rateClass}`}>{rate}% follow-through</span>}
      </div>

      <div className="history-row">
        {last7.map((date) => {
          const status = commitment.history[date]
          const dayLabel = SHORT_DAY[new Date(date + 'T12:00:00').getDay()]
          const isToday = date === today
          return (
            <div
              key={date}
              className={`history-dot ${status || ''} ${isToday ? 'today' : ''}`}
              title={`${date}: ${status || 'pending'}`}
            >
              {dayLabel}
            </div>
          )
        })}
      </div>

      <div className="action-row">
        {!todayStatus && (
          <>
            <button className="btn btn-primary btn-sm" onClick={() => onMark(commitment.id, today, 'done')}>
              Done
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onMark(commitment.id, today, 'missed')}>
              Missed
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onMark(commitment.id, today, 'skipped')}>
              Skip
            </button>
          </>
        )}
        {todayStatus && (
          <span className="chip" style={{ textTransform: 'capitalize' }}>
            Today: {todayStatus}
          </span>
        )}
        <button className="btn btn-secondary btn-sm" onClick={() => onEdit(commitment.id)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(commitment.id)}>Delete</button>
      </div>
    </div>
  )
}
