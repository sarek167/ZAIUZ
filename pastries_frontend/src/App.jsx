import { useCallback, useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from './api/client'
import './App.css'
import { Chart } from './components/dashboard/Chart'
import { NavBar } from './components/layout/NavBar'
import { useAuth } from './context/AuthContext'

function App() {
  const { loading: authLoading } = useAuth()
  const [measurements, setMeasurements] = useState([])
  const [series, setSeries] = useState([])
  const [appliedFilters, setAppliedFilters] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')

  const refreshSeries = useCallback(async () => {
    const response = await apiClient.get('/api/series')
    const nextSeries = response.data
    const previousIds = series.map((item) => String(item.id))
    const nextIds = nextSeries.map((item) => String(item.id))

    setSeries(nextSeries)
    setAppliedFilters((current) => {
      const previousSelection = current?.selectedSeriesIds ?? []
      const hadAllSeriesSelected =
        previousIds.length === 0 ||
        (previousSelection.length === previousIds.length &&
          previousIds.every((id) => previousSelection.includes(id)))
      return {
        dateRange: current?.dateRange ?? null,
        selectedSeriesIds: hadAllSeriesSelected
          ? nextIds
          : previousSelection.filter((id) => nextIds.includes(id)),
      }
    })
    setLoadError('')
  }, [series])

  useEffect(() => {
    if (authLoading) return undefined

    const controller = new AbortController()

    const loadSeries = async () => {
      try {
        const seriesResponse = await apiClient.get('/api/series', {
          signal: controller.signal,
        })
        setSeries(seriesResponse.data)
        setAppliedFilters({
          dateRange: null,
          selectedSeriesIds: seriesResponse.data.map((item) =>
            String(item.id),
          ),
        })
        if (seriesResponse.data.length === 0) {
          setIsLoading(false)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(getErrorMessage(error))
          setIsLoading(false)
        }
      }
    }

    loadSeries()
    return () => controller.abort()
  }, [authLoading])

  useEffect(() => {
    if (authLoading || appliedFilters === null) return undefined

    const controller = new AbortController()
    const { dateRange, selectedSeriesIds } = appliedFilters
    const allSeriesSelected =
      series.length > 0 &&
      selectedSeriesIds.length === series.length &&
      series.every((item) =>
        selectedSeriesIds.includes(String(item.id)),
      )
    const params = {
      limit: 10000,
      ...(!allSeriesSelected && {
        series:
          selectedSeriesIds.length > 0 ? selectedSeriesIds.join(',') : '0',
      }),
      ...(dateRange?.fromTimestamp != null && {
        from: new Date(dateRange.fromTimestamp).toISOString(),
      }),
      ...(dateRange?.toTimestamp != null && {
        to: new Date(dateRange.toTimestamp).toISOString(),
      }),
    }

    const loadMeasurements = async () => {
      try {
        const response = await apiClient.get('/api/measurements', {
          params,
          signal: controller.signal,
        })
        setMeasurements(response.data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setMeasurements([])
          setLoadError(getErrorMessage(error))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    loadMeasurements()
    return () => controller.abort()
  }, [appliedFilters, series, authLoading])

  const handleFiltersApply = (nextFilters) => {
    setAppliedFilters(nextFilters)
    setLoadError('')
    setIsRefreshing(true)
  }

  return (
    <div>
      <NavBar series={series} onSeriesChanged={refreshSeries} />
      <main>
        <h1>Pomiar sprzedaży pączków</h1>
        {isLoading ? (
          <p>Wczytywanie pomiarów...</p>
        ) : appliedFilters === null ? (
          <p role="alert">Nie udało się wczytać danych: {loadError}</p>
        ) : (
          <>
            {loadError && (
              <p role="alert">Nie udało się wczytać pomiarów: {loadError}</p>
            )}
            {isRefreshing && <p aria-live="polite">Aktualizowanie wykresu...</p>}
            <Chart
              measurements={measurements}
              series={series}
              selectedSeriesIds={appliedFilters.selectedSeriesIds}
              onFiltersApply={handleFiltersApply}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App
