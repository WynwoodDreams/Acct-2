import { useState } from 'react'

const SCHEDULE_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'custom', label: 'Custom Days' },
  { value: 'specific', label: 'Specific Date' },
  { value: 'once', label: 'One Time' },
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CommitmentForm({ commitment, onSave, onCancel }) {
  const [title, setTitle] = useState(commitment?.title || '')
  const [description, setDescription] = useState(commitment?.description || '')
  const [deadline, setDeadline] = useState(commitment?.deadline || '')
  const [scheduleType, setScheduleType] = useState(commitment?.schedule?.type || 'daily')
  const [customDays, setCustomDays] = useState(commitment?.schedule?.days || [])
  const [specificDate, setSpecificDate] = useState(commitment?.schedule?.date || '')

  function toggleDay(day) {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    const schedule = { type: scheduleType }
    if (scheduleType === 'custom') schedule.days = customDays
    if (scheduleType === 'specific' || scheduleType === 'once') schedule.date = specificDate

    const data = {
      title: title.trim(),
      description: description.trim(),
      deadline,
      schedule,
    }

    if (commitment) data.id = commitment.id
    onSave(data)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{commitment ? 'Edit Commitment' : 'New Commitment'}</h2>

      <div className="form-group">
        <label>What are you committing to?</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Exercise for 30 minutes"
          required
        />
      </div>

      <div className="form-group">
        <label>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why does this matter? Any details?"
        />
      </div>

      <div className="form-group">
        <label>Deadline (optional)</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Schedule</label>
        <div className="schedule-options">
          {SCHEDULE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={scheduleType === t.value ? 'selected' : ''}
              onClick={() => setScheduleType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {scheduleType === 'custom' && (
          <div className="day-picker">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                className={customDays.includes(i) ? 'selected' : ''}
                onClick={() => toggleDay(i)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {(scheduleType === 'specific' || scheduleType === 'once') && (
          <div style={{ marginTop: '0.5rem' }}>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {commitment ? 'Save Changes' : 'Add Commitment'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
