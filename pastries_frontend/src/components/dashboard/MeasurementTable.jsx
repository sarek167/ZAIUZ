import { useEffect, useRef } from 'react';
import { formatTimestamp } from './chartUtils';

export const MeasurementTable = ({
  measurements,
  selectedMeasurementId,
  onMeasurementClick,
}) => {
  const containerRef = useRef(null);
  const rowRefs = useRef(new Map());

  useEffect(() => {
    if (selectedMeasurementId == null) return;

    const container = containerRef.current;
    const row = rowRefs.current.get(String(selectedMeasurementId));
    if (!container || !row) return;

    const containerBounds = container.getBoundingClientRect();
    const rowBounds = row.getBoundingClientRect();
    if (rowBounds.top < containerBounds.top) {
      container.scrollTo({
        top: container.scrollTop + rowBounds.top - containerBounds.top,
        behavior: 'smooth',
      });
    } else if (rowBounds.bottom > containerBounds.bottom) {
      container.scrollTo({
        top: container.scrollTop + rowBounds.bottom - containerBounds.bottom,
        behavior: 'smooth',
      });
    }
  }, [selectedMeasurementId]);

  return (
    <section className="measurement-table-section">
      <h2>Wyniki pomiarów</h2>
      <div
        className="measurement-table-container"
        ref={containerRef}
        role="region"
        aria-label="Wyniki pomiarów. Tabela przewijana."
        tabIndex={0}
      >
        <table className="measurement-table">
          <thead>
            <tr>
              <th scope="col">Data i godzina</th>
              <th scope="col">Seria</th>
              <th scope="col">Wartość</th>
              <th scope="col">Czujnik</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((point) => {
              const measurement = point.measurement;
              const isSelected =
                String(measurement.id) === String(selectedMeasurementId);

              return (
                <tr
                  key={measurement.id}
                  ref={(element) => {
                    if (element) {
                      rowRefs.current.set(String(measurement.id), element);
                    } else {
                      rowRefs.current.delete(String(measurement.id));
                    }
                  }}
                  className={isSelected ? 'measurement-table-row--selected' : ''}
                >
                  <td>
                    <button
                      type="button"
                      className="measurement-table-select"
                      aria-pressed={isSelected}
                      onClick={() => onMeasurementClick(measurement)}
                    >
                      {formatTimestamp(measurement.timestamp)}
                    </button>
                  </td>
                  <td>{point.seriesName}</td>
                  <td>
                    {measurement.value}
                    {point.unit ? ` ${point.unit}` : ''}
                  </td>
                  <td>
                    {measurement.sensorId == null
                      ? '—'
                      : `#${measurement.sensorId}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
