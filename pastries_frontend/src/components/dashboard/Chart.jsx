import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartDateFilter } from './ChartDateFilter';
import { MeasurementDot } from './MeasurementDot';
import { MeasurementTooltip } from './MeasurementTooltip';
import { formatTimestamp } from './chartUtils';
import './Chart.css';

const FALLBACK_COLORS = ['#1f77b4', '#d62728', '#2ca02c', '#9467bd', '#ff7f0e'];
const LINE_STYLES = [undefined, '6 3', '2 3', '10 3 2 3', '1 4'];

export const Chart = ({
  measurements = [],
  series = [],
  selectedMeasurementId,
  onMeasurementClick,
}) => {
  const [dateRange, setDateRange] = useState(null);
  const [internalSelectedMeasurementId, setInternalSelectedMeasurementId] =
    useState(null);
  const activeMeasurementId =
    selectedMeasurementId === undefined
      ? internalSelectedMeasurementId
      : selectedMeasurementId;

  const filteredMeasurements = useMemo(
    () =>
      measurements.filter((measurement) => {
        const timestamp = new Date(measurement.timestamp).getTime();
        return (
          Number.isFinite(timestamp) &&
          (dateRange?.fromTimestamp == null ||
            timestamp >= dateRange.fromTimestamp) &&
          (dateRange?.toTimestamp == null || timestamp <= dateRange.toTimestamp)
        );
      }),
    [dateRange, measurements],
  );

  const { chartSeries, chartData } = useMemo(() => {
    const seriesById = new Map(series.map((item) => [String(item.id), item]));
    const measurementSeriesIds = [
      ...new Set(
        filteredMeasurements.map((measurement) =>
          String(measurement.seriesId),
        ),
      ),
    ];
    const chartSeries = measurementSeriesIds.map((id, index) => {
      const details = seriesById.get(id);

      return {
        id,
        name: details?.name ?? `Seria ${id}`,
        color: details?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
        dataKey: `series-${encodeURIComponent(id)}`,
      };
    });
    const chartSeriesById = new Map(
      chartSeries.map((item) => [item.id, item]),
    );
    const chartData = filteredMeasurements
      .map((measurement) => {
        const measurementSeriesId = String(measurement.seriesId);
        const measurementSeries = chartSeriesById.get(measurementSeriesId);

        return {
          timestamp: new Date(measurement.timestamp).getTime(),
          value: measurement.value,
          measurement,
          seriesName: measurementSeries.name,
          unit: seriesById.get(measurementSeriesId)?.unit,
          [measurementSeries.dataKey]: measurement.value,
        };
      })
      .sort((first, second) => first.timestamp - second.timestamp);

    return { chartSeries, chartData };
  }, [filteredMeasurements, series]);

  const handleMeasurementClick = (measurement) => {
    if (selectedMeasurementId === undefined) {
      setInternalSelectedMeasurementId(measurement.id);
    }
    onMeasurementClick?.(measurement);
  };

  return (
    <div className="chart-section">
      <ChartDateFilter
        onApply={setDateRange}
        onReset={() => setDateRange(null)}
      />
      {filteredMeasurements.length === 0 ? (
        <p className="chart-empty">
          {measurements.length === 0
            ? 'Brak pomiarów do wyświetlenia.'
            : 'Brak pomiarów w wybranym zakresie dat.'}
        </p>
      ) : (
        <div className="measurement-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 24, bottom: 20, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="timestamp"
                name="Czas"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatTimestamp}
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{ value: 'Czas', position: 'insideBottom', offset: -12 }}
              />
              <YAxis
                type="number"
                dataKey="value"
                name="Wartość"
                tickLine={false}
                label={{
                  value: 'Wartość pomiaru',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Legend />
              <Tooltip content={<MeasurementTooltip />} />
              {chartSeries.map((item, index) => (
                <Line
                  key={item.id}
                  name={item.name}
                  dataKey={item.dataKey}
                  fill={item.color}
                  stroke={item.color}
                  strokeWidth={2}
                  strokeDasharray={LINE_STYLES[index % LINE_STYLES.length]}
                  connectNulls
                  isAnimationActive={false}
                  dot={(shapeProps) => (
                    <MeasurementDot
                      {...shapeProps}
                      fill={item.color}
                      seriesId={item.id}
                      isSelected={
                        String(shapeProps.payload?.measurement?.id) ===
                        String(activeMeasurementId)
                      }
                      onMeasurementClick={handleMeasurementClick}
                    />
                  )}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
