import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartDateFilter } from './ChartDateFilter';
import { ChartLegend } from './ChartLegend';
import { MeasurementDot } from './MeasurementDot';
import { MeasurementTable } from './MeasurementTable';
import { MeasurementTooltip } from './MeasurementTooltip';
import {
  formatTimestamp,
  getChartData,
  getChartSeries,
  getEmptyChartMessage,
  LINE_STYLES,
} from './chartUtils';
import './Chart.css';

export const Chart = ({
  measurements = [],
  series = [],
  selectedSeriesIds = [],
  onFiltersApply,
  selectedMeasurementId,
  onMeasurementClick,
}) => {
  const [internalSelectedMeasurementId, setInternalSelectedMeasurementId] =
    useState(null);
  const activeMeasurementId =
    selectedMeasurementId === undefined
      ? internalSelectedMeasurementId
      : selectedMeasurementId;

  const availableSeries = useMemo(
    () => getChartSeries(series, measurements),
    [measurements, series],
  );

  const selectedSeriesIdSet = new Set(selectedSeriesIds);
  const chartSeries = availableSeries.filter((item) =>
    selectedSeriesIdSet.has(item.id),
  );
  const filteredMeasurements = measurements.filter((measurement) =>
    selectedSeriesIdSet.has(String(measurement.seriesId)),
  );

  const chartData = useMemo(
    () => getChartData(filteredMeasurements, chartSeries, series),
    [chartSeries, filteredMeasurements, series],
  );

  const handleFiltersApply = ({
    dateRange: nextDateRange,
    selectedSeriesIds: nextSelectedSeriesIds,
  }) => {
    onFiltersApply?.({
      dateRange: nextDateRange,
      selectedSeriesIds: nextSelectedSeriesIds,
    });
  };

  const handleFiltersReset = () => {
    handleFiltersApply({
      dateRange: { fromTimestamp: null, toTimestamp: null },
      selectedSeriesIds: series.map((item) => String(item.id)),
    });
  };

  const handleMeasurementClick = (measurement) => {
    if (selectedMeasurementId === undefined) {
      setInternalSelectedMeasurementId(measurement.id);
    }
    onMeasurementClick?.(measurement);
  };

  return (
    <div className="chart-section">
      <ChartDateFilter
        series={series}
        selectedSeriesIds={selectedSeriesIds}
        onApply={handleFiltersApply}
        onReset={handleFiltersReset}
      />
      {filteredMeasurements.length === 0 ? (
        <p className="chart-empty">
          {getEmptyChartMessage(selectedSeriesIds, measurements)}
        </p>
      ) : (
        <div
          className="measurement-chart"
          role="region"
          aria-label="Wykres pomiarów. Na małym ekranie przewiń poziomo."
          tabIndex={0}
        >
          <div className="measurement-chart-content">
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
                  label={{
                    value: 'Czas',
                    position: 'insideBottom',
                    offset: -12,
                  }}
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
        </div>
      )}
      {filteredMeasurements.length > 0 && (
        <ChartLegend series={chartSeries} lineStyles={LINE_STYLES} />
      )}
      {filteredMeasurements.length > 0 && (
        <MeasurementTable
          measurements={chartData}
          selectedMeasurementId={activeMeasurementId}
          onMeasurementClick={handleMeasurementClick}
        />
      )}
    </div>
  );
};
