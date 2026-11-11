import { useState } from 'react'
import {
  getSeriesFormValues,
  toSeriesPayload,
  validateSeriesForm,
} from './utils'

const SeriesForm = ({ series, isSaving, onSave, onCancel }) => {
  const [form, setForm] = useState(() => getSeriesFormValues(series))
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateSeriesForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    await onSave(toSeriesPayload(form))
  }

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  return (
    <form className="admin-form admin-series-form" onSubmit={handleSubmit}>
      {error && (
        <p className="admin-message admin-message--error" role="alert">
          {error}
        </p>
      )}
      <label>
        Nazwa serii
        <input
          value={form.name}
          onChange={update('name')}
          maxLength={100}
          required
          disabled={isSaving}
        />
      </label>
      <div className="admin-form-row">
        <label>
          Wartość minimalna
          <input
            type="number"
            step="any"
            value={form.minValue}
            onChange={update('minValue')}
            required
            disabled={isSaving}
          />
        </label>
        <label>
          Wartość maksymalna
          <input
            type="number"
            step="any"
            value={form.maxValue}
            onChange={update('maxValue')}
            required
            disabled={isSaving}
          />
        </label>
      </div>
      <label>
        Kolor serii
        <span className="admin-color-input">
          <input
            type="color"
            value={form.color}
            onChange={update('color')}
            disabled={isSaving}
          />
          <code>{form.color}</code>
        </span>
      </label>
      <div className="admin-form-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Zapisywanie...' : series ? 'Zapisz zmiany' : 'Utwórz serię'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="admin-secondary-button"
            onClick={onCancel}
            disabled={isSaving}
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  )
}

const SeriesList = ({ series, isSaving, onEdit, onDelete }) => {
  if (series.length === 0) return <p>Nie ma jeszcze żadnych serii.</p>

  return (
    <ul className="admin-resource-list">
      {series.map((item) => (
        <li key={item.id}>
          <span className="admin-resource-description">
            <span
              className="admin-color-swatch"
              style={{ backgroundColor: item.color }}
            />
            <span>
              <strong>{item.name}</strong>
              <small>{item.minValue}–{item.maxValue}</small>
            </span>
          </span>
          <span className="admin-resource-actions">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => onEdit(item)}
              disabled={isSaving}
            >
              Edytuj
            </button>
            <button
              type="button"
              className="admin-danger-button"
              onClick={() => onDelete(item)}
              disabled={isSaving}
            >
              Usuń
            </button>
          </span>
        </li>
      ))}
    </ul>
  )
}

export const SeriesManagement = ({ series, isSaving, onSave, onDelete }) => {
  const [editingSeriesId, setEditingSeriesId] = useState(null)
  const editingSeries =
    series.find((item) => item.id === editingSeriesId) ?? null

  const handleSave = async (data) => {
    const wasSaved = await onSave(editingSeriesId, data)
    if (wasSaved) setEditingSeriesId(null)
  }

  return (
    <div className="admin-panel-content">
      <h3>{editingSeries ? 'Edytuj serię' : 'Dodaj serię'}</h3>
      <SeriesForm
        key={editingSeriesId ?? 'new'}
        series={editingSeries}
        onSave={handleSave}
        onCancel={
          editingSeries ? () => setEditingSeriesId(null) : null
        }
        isSaving={isSaving}
      />
      <h3>Istniejące serie</h3>
      <SeriesList
        series={series}
        isSaving={isSaving}
        onEdit={(item) => setEditingSeriesId(item.id)}
        onDelete={onDelete}
      />
    </div>
  )
}
