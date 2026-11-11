export const getSeriesFormValues = (series) =>
  series
    ? {
        name: series.name,
        minValue: String(series.minValue),
        maxValue: String(series.maxValue),
        color: series.color,
      }
    : { name: '', minValue: '', maxValue: '', color: '#2a71a3' }

export const validateSeriesForm = ({ name, minValue, maxValue }) => {
  if (!name.trim()) return 'Podaj nazwę serii.'
  if (!minValue.trim() || !maxValue.trim()) {
    return 'Podaj wartości minimalną i maksymalną.'
  }

  const min = Number(minValue)
  const max = Number(maxValue)
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    return 'Wartość minimalna musi być mniejsza od maksymalnej.'
  }

  return ''
}

export const toSeriesPayload = ({ name, minValue, maxValue, color }) => ({
  name: name.trim(),
  minValue: Number(minValue),
  maxValue: Number(maxValue),
  color,
})

export const splitCreatedSensor = ({ apiKey, ...sensor }) => ({
  apiKey,
  sensor,
})

export const getSeriesName = (series, seriesId) =>
  series.find((item) => String(item.id) === String(seriesId))?.name ??
  seriesId
