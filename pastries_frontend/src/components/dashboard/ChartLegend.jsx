export const ChartLegend = ({ series, lineStyles }) => (
  <div
    className="chart-legend"
    role="region"
    aria-label="Legenda wykresu. Przewiń poziomo, aby zobaczyć wszystkie serie."
    tabIndex={0}
  >
    <ul className="chart-legend-items">
      {series.map((item, index) => (
        <li className="chart-legend-item" key={item.id}>
          <svg
            className="chart-legend-mark"
            viewBox="0 0 24 12"
            aria-hidden="true"
          >
            <line
              x1="1"
              y1="6"
              x2="23"
              y2="6"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={lineStyles[index % lineStyles.length]}
            />
            <circle cx="12" cy="6" r="3" fill={item.color} />
          </svg>
          <span>{item.name}</span>
        </li>
      ))}
    </ul>
  </div>
);
