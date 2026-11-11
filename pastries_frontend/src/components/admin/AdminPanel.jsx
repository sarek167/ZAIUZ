import { useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from '../../api/client'
import { SensorManagement } from './SensorManagement'
import { SeriesManagement } from './SeriesManagement'
import { splitCreatedSensor } from './utils'
import './admin.css'

export const AdminPanel = ({ isOpen, onClose, series, onSeriesChanged }) => {
  const [activeTab, setActiveTab] = useState('series')
  const [sensors, setSensors] = useState([])
  const [isLoadingSensors, setIsLoadingSensors] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createdApiKey, setCreatedApiKey] = useState('')

  useEffect(() => {
    if (!isOpen || activeTab !== 'sensors') return undefined

    const controller = new AbortController()
    const loadSensors = async () => {
      setIsLoadingSensors(true)
      setError('')
      try {
        const response = await apiClient.get('/api/sensors', {
          signal: controller.signal,
        })
        setSensors(response.data)
      } catch (requestError) {
        if (!controller.signal.aborted) setError(getErrorMessage(requestError))
      } finally {
        if (!controller.signal.aborted) setIsLoadingSensors(false)
      }
    }

    loadSensors()
    return () => controller.abort()
  }, [activeTab, isOpen])

  if (!isOpen) return null

  const clearMessages = () => {
    setError('')
    setNotice('')
  }

  const runSeriesMutation = async (action, successMessage) => {
    setIsSaving(true)
    clearMessages()
    try {
      await action()
      await onSeriesChanged()
      setNotice(successMessage)
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleSeriesSave = (seriesId, data) =>
    runSeriesMutation(
      () =>
        seriesId === null
          ? apiClient.post('/api/series', data)
          : apiClient.put(`/api/series/${seriesId}`, data),
      seriesId === null
        ? 'Seria została utworzona.'
        : 'Zmiany serii zostały zapisane.',
    )

  const handleSeriesDelete = async (item) => {
    if (
      !window.confirm(
        `Czy na pewno usunąć serię „${item.name}” wraz z jej pomiarami i przypisanymi czujnikami?`,
      )
    ) {
      return
    }
    await runSeriesMutation(
      () => apiClient.delete(`/api/series/${item.id}`),
      'Seria została usunięta.',
    )
  }

  const handleSensorCreate = async ({ name, seriesId }) => {
    setIsSaving(true)
    clearMessages()
    setCreatedApiKey('')
    try {
      const response = await apiClient.post('/api/sensors', { name, seriesId })
      const { apiKey, sensor } = splitCreatedSensor(response.data)
      setSensors((current) => [...current, sensor])
      if (apiKey) {
        setCreatedApiKey(apiKey)
        setNotice(`Czujnik „${sensor.name}” został zarejestrowany.`)
      } else {
        setError(
          'Czujnik został zarejestrowany, ale API nie zwróciło klucza. Zarejestruj nowy czujnik, aby uzyskać klucz API.',
        )
      }
      return true
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleSensorDelete = async (sensor) => {
    if (
      !window.confirm(
        `Czy na pewno wyrejestrować czujnik „${sensor.name}”? Jego klucz API przestanie działać.`,
      )
    ) {
      return
    }
    setIsSaving(true)
    clearMessages()
    try {
      await apiClient.delete(`/api/sensors/${sensor.id}`)
      setSensors((current) => current.filter((item) => item.id !== sensor.id))
      setNotice(`Czujnik „${sensor.name}” został wyrejestrowany.`)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    clearMessages()
    setCreatedApiKey('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-content admin-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          aria-label="Zamknij zarządzanie"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 id="admin-panel-title">Zarządzanie danymi</h2>
        <div className="admin-tabs" role="tablist" aria-label="Zasoby do zarządzania">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'series'}
            onClick={() => handleTabChange('series')}
          >
            Serie
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sensors'}
            onClick={() => handleTabChange('sensors')}
          >
            Czujniki
          </button>
        </div>

        {error && (
          <p className="admin-message admin-message--error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="admin-message admin-message--success" role="status">
            {notice}
          </p>
        )}

        {activeTab === 'series' ? (
          <SeriesManagement
            series={series}
            isSaving={isSaving}
            onSave={handleSeriesSave}
            onDelete={handleSeriesDelete}
          />
        ) : (
          <SensorManagement
            series={series}
            sensors={sensors}
            isSaving={isSaving}
            isLoading={isLoadingSensors}
            createdApiKey={createdApiKey}
            onCreate={handleSensorCreate}
            onDelete={handleSensorDelete}
          />
        )}
      </section>
    </div>
  )
}
