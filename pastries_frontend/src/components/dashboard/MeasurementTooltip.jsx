import { formatTimestamp } from './chartUtils';

export const MeasurementTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  if (!point.measurement) return null;

  return (
    <div className="measurement-tooltip">
      <strong>{point.seriesName}</strong>
      <div>
        {point.measurement.value}
        {point.unit ? ` ${point.unit}` : ''}
      </div>
      <time dateTime={point.measurement.timestamp}>
        {formatTimestamp(point.measurement.timestamp)}
      </time>
    </div>
  );
};
