export const FALLBACK_COLORS = [
  '#1f77b4',
  '#d62728',
  '#2ca02c',
  '#9467bd',
  '#ff7f0e',
];
export const LINE_STYLES = [undefined, '6 3', '2 3', '10 3 2 3', '1 4'];

export const INITIAL_DATE_FILTER_DRAFT = {
  fromDate: '',
  fromTime: '00:00',
  toDate: '',
  toTime: '23:59',
};

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatTimestamp = (timestamp) =>
  dateTimeFormatter.format(new Date(timestamp));

export const isValidPolishDate = (date) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  if (!match) return false;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const parsedDate = new Date(year, month - 1, day);

  return (
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
};

export const isValidTime = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

export const getDateTimeTimestamp = (date, time, endOfMinute = false) => {
  if (!date) return null;
  if (!isValidPolishDate(date) || !isValidTime(time)) return Number.NaN;

  const [day, month, year] = date.split('.');
  const timestamp = new Date(
    `${year}-${month}-${day}T${time}`,
  ).getTime();
  return endOfMinute ? timestamp + 59999 : timestamp;
};

export const validateDateFilterDraft = (draft) => {
  if (
    (draft.fromDate && !isValidPolishDate(draft.fromDate)) ||
    (draft.toDate && !isValidPolishDate(draft.toDate))
  ) {
    return { error: 'Wpisz datę w formacie DD.MM.RRRR.' };
  }

  if (
    (draft.fromDate && !isValidTime(draft.fromTime)) ||
    (draft.toDate && !isValidTime(draft.toTime))
  ) {
    return {
      error: 'Wpisz godzinę w formacie 24-godzinnym, np. 09:30.',
    };
  }

  const fromTimestamp = getDateTimeTimestamp(draft.fromDate, draft.fromTime);
  const toTimestamp = getDateTimeTimestamp(draft.toDate, draft.toTime, true);
  if (
    fromTimestamp !== null &&
    toTimestamp !== null &&
    fromTimestamp > toTimestamp
  ) {
    return {
      error:
        'Data i godzina początkowa nie mogą być późniejsze niż końcowe.',
    };
  }

  return {
    error: '',
    dateRange: { fromTimestamp, toTimestamp },
  };
};

export const getChartSeries = (series, measurements) => {
  const seriesById = new Map(series.map((item) => [String(item.id), item]));
  const measurementSeriesIds = measurements.map((measurement) =>
    String(measurement.seriesId),
  );
  const seriesIds = [
    ...new Set([
      ...series.map((item) => String(item.id)),
      ...measurementSeriesIds,
    ]),
  ];

  return seriesIds.map((id, index) => {
    const details = seriesById.get(id);

    return {
      id,
      name: details?.name ?? `Seria ${id}`,
      color: details?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      dataKey: `series-${encodeURIComponent(id)}`,
    };
  });
};

export const getChartData = (measurements, chartSeries, series) => {
  const seriesById = new Map(series.map((item) => [String(item.id), item]));
  const chartSeriesById = new Map(
    chartSeries.map((item) => [item.id, item]),
  );

  return measurements
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
};

export const getEmptyChartMessage = (selectedSeriesIds, measurements) => {
  if (selectedSeriesIds.length === 0) return 'Nie wybrano żadnych serii.';
  if (measurements.length === 0) return 'Brak pomiarów dla wybranych filtrów.';
  return 'Brak pomiarów dla wybranych serii.';
};
