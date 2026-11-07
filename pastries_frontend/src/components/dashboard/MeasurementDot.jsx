import { formatTimestamp } from './chartUtils';

export const MeasurementDot = ({
  cx,
  cy,
  payload,
  fill,
  seriesId,
  isSelected,
  onMeasurementClick,
}) => {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;

  const measurement = payload.measurement;
  if (!measurement || String(measurement.seriesId) !== seriesId) return null;

  const label = `${payload.seriesName}, ${measurement.value}${payload.unit ? ` ${payload.unit}` : ''}, ${formatTimestamp(measurement.timestamp)}`;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onMeasurementClick(measurement);
    }
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 5}
      fill={fill}
      stroke={isSelected ? '#111827' : '#fff'}
      strokeWidth={isSelected ? 3 : 1.5}
      role={onMeasurementClick ? 'button' : undefined}
      tabIndex={onMeasurementClick ? 0 : undefined}
      aria-label={onMeasurementClick ? label : undefined}
      aria-pressed={onMeasurementClick ? isSelected : undefined}
      className={onMeasurementClick ? 'measurement-dot--clickable' : undefined}
      onClick={
        onMeasurementClick
          ? () => onMeasurementClick(measurement)
          : undefined
      }
      onKeyDown={onMeasurementClick ? handleKeyDown : undefined}
    />
  );
};
