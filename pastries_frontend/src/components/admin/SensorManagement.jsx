import { useState } from 'react'
import { getSeriesName } from './utils'

const SensorForm = ({ series, isSaving, onCreate }) => {
  const [name, setName] = useState('')
  const [seriesId, setSeriesId] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const wasCreated = await onCreate({ name: name.trim(), seriesId })
    if (wasCreated) {
      setName('')
      setSeriesId('')
    }
  }

  return (
    <>
      <h3>Zarejestruj czujnik</h3>
      {series.length === 0 ? (
        <p>Najpierw utwórz serię, do której będzie przypisany czujnik.</p>
      ) : (
        <form className="admin-form admin-sensor-form" onSubmit={handleSubmit}>
          <label>
            Nazwa czujnika
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
              disabled={isSaving}
            />
          </label>
          <label>
            Seria
            <select
              value={seriesId}
              onChange={(event) => setSeriesId(event.target.value)}
              required
              disabled={isSaving}
            >
              <option value="" disabled>Wybierz serię</option>
              {series.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Rejestrowanie...' : 'Zarejestruj czujnik'}
          </button>
        </form>
      )}
    </>
  )
}

const SensorList = ({ sensors, series, isLoading, isSaving, onDelete }) => {
  if (isLoading) return <p>Wczytywanie czujników...</p>
  if (sensors.length === 0) return <p>Nie ma zarejestrowanych czujników.</p>

  return (
    <ul className="admin-resource-list">
      {sensors.map((sensor) => (
        <li key={sensor.id}>
          <span className="admin-resource-description">
            <span>
              <strong>{sensor.name}</strong>
              <small>Seria: {getSeriesName(series, sensor.seriesId)}</small>
            </span>
          </span>
          <button
            type="button"
            className="admin-danger-button"
            onClick={() => onDelete(sensor)}
            disabled={isSaving}
          >
            Wyrejestruj
          </button>
        </li>
      ))}
    </ul>
  )
}

export const SensorManagement = ({
  series,
  sensors,
  isSaving,
  isLoading,
  createdApiKey,
  onCreate,
  onDelete,
}) => (
  <div className="admin-panel-content">
    <SensorForm series={series} isSaving={isSaving} onCreate={onCreate} />
    {createdApiKey && (
      <div className="admin-api-key" role="status">
        <strong>Skopiuj klucz API - zostanie pokazany tylko teraz:</strong>
        <code>{createdApiKey}</code>
      </div>
    )}
    <h3>Zarejestrowane czujniki</h3>
    <SensorList
      sensors={sensors}
      series={series}
      isLoading={isLoading}
      isSaving={isSaving}
      onDelete={onDelete}
    />
  </div>
)
