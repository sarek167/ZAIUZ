import { useEffect, useState } from 'react'
import { apiClient, getErrorMessage } from './api/client'
import './App.css'
import { Chart } from './components/dashboard/Chart'
import { NavBar } from './components/layout/NavBar'

function App() {
  const [measurements, setMeasurements] = useState([])
  const [series, setSeries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadChartData = async () => {
      try {
        const [measurementsResponse, seriesResponse] = await Promise.all([
          apiClient.get('/api/measurements', {
            params: { limit: 10000 },
            signal: controller.signal,
          }),
          apiClient.get('/api/series', { signal: controller.signal }),
        ])
        setMeasurements(measurementsResponse.data)
        setSeries(seriesResponse.data)
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(getErrorMessage(error))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadChartData()
    return () => controller.abort()
  }, [])

  return (
    <div>
      <NavBar />
      <main>
        <h1>Pomiar sprzedaży pączków</h1>
        {isLoading ? (
          <p>Wczytywanie pomiarów...</p>
        ) : loadError ? (
          <p role="alert">Nie udało się wczytać danych: {loadError}</p>
        ) : (
          <Chart measurements={measurements} series={series} />
        )}
      </main>
    </div>
  )
}

export default App
