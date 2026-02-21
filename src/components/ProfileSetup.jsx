import { useState } from 'react'

const DEFAULT_PROFILE = {
  strengths: [],
  improvementAreas: [],
  workContext: '',
  lifeContext: '',
}

export default function ProfileSetup({ profile, onSave }) {
  const [form, setForm] = useState(profile || DEFAULT_PROFILE)
  const [strengthInput, setStrengthInput] = useState('')
  const [areaInput, setAreaInput] = useState('')

  function addStrength() {
    const val = strengthInput.trim()
    if (val && !form.strengths.includes(val)) {
      setForm({ ...form, strengths: [...form.strengths, val] })
      setStrengthInput('')
    }
  }

  function removeStrength(s) {
    setForm({ ...form, strengths: form.strengths.filter((x) => x !== s) })
  }

  function addArea() {
    const val = areaInput.trim()
    if (val && !form.improvementAreas.includes(val)) {
      setForm({ ...form, improvementAreas: [...form.improvementAreas, val] })
      setAreaInput('')
    }
  }

  function removeArea(a) {
    setForm({ ...form, improvementAreas: form.improvementAreas.filter((x) => x !== a) })
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{profile ? 'Edit Profile' : 'Set Up Your Profile'}</h2>

      <div className="form-group">
        <label>Strengths</label>
        <div className="chip-input-row">
          <input
            value={strengthInput}
            onChange={(e) => setStrengthInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
            placeholder="e.g. Consistency, Focus"
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addStrength}>Add</button>
        </div>
        <div className="chip-group">
          {form.strengths.map((s) => (
            <span key={s} className="chip" onClick={() => removeStrength(s)} style={{ cursor: 'pointer' }}>
              {s} &times;
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Areas for Improvement</label>
        <div className="chip-input-row">
          <input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addArea())}
            placeholder="e.g. Time management, Exercise"
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addArea}>Add</button>
        </div>
        <div className="chip-group">
          {form.improvementAreas.map((a) => (
            <span key={a} className="chip" onClick={() => removeArea(a)} style={{ cursor: 'pointer' }}>
              {a} &times;
            </span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Work Context</label>
        <textarea
          value={form.workContext}
          onChange={(e) => setForm({ ...form, workContext: e.target.value })}
          placeholder="What do you do for work? What are your goals?"
        />
      </div>

      <div className="form-group">
        <label>Life Context</label>
        <textarea
          value={form.lifeContext}
          onChange={(e) => setForm({ ...form, lifeContext: e.target.value })}
          placeholder="Hobbies, family, health goals, side projects..."
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        {profile ? 'Save Changes' : 'Get Started'}
      </button>
    </form>
  )
}
