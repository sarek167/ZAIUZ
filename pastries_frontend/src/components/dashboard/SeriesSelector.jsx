export const SeriesSelector = ({
  series,
  selectedSeriesIds,
  onToggle,
  onSelectAll,
  onClearAll,
}) => {
  const selectedSeriesIdSet = new Set(
    selectedSeriesIds.map((id) => String(id)),
  );

  return (
    <details className="chart-series-selector">
      <summary>
        Serie ({selectedSeriesIdSet.size}/{series.length})
      </summary>
      <div className="chart-series-options">
        <div className="chart-series-actions">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={selectedSeriesIdSet.size === series.length}
          >
            Zaznacz wszystkie
          </button>
          <button
            type="button"
            onClick={onClearAll}
            disabled={selectedSeriesIdSet.size === 0}
          >
            Odznacz wszystkie
          </button>
        </div>
        {series.map((item) => (
          <label className="chart-series-option" key={item.id}>
            <input
              type="checkbox"
              checked={selectedSeriesIdSet.has(String(item.id))}
              onChange={() => onToggle(String(item.id))}
            />
            <span
              className="chart-series-color"
              style={{ '--series-color': item.color }}
              aria-hidden="true"
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </details>
  );
};
