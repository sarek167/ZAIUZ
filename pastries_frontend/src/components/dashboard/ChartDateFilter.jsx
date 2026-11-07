import { useState } from 'react';
import {
  INITIAL_DATE_FILTER_DRAFT,
  validateDateFilterDraft,
} from './chartUtils';
import { SeriesSelector } from './SeriesSelector';

const DateTimeFieldset = ({
  label,
  period,
  dateAriaLabel,
  timeAriaLabel,
  draft,
  dateError,
  onChange,
}) => (
  <fieldset className="chart-date-field">
    <legend className="chart-date-label">{label}</legend>
    <div className="chart-date-inputs">
      <label>
        <span>Data</span>
        <input
          className="chart-date-input--date"
          type="text"
          name={`${period}Date`}
          inputMode="numeric"
          placeholder="DD.MM.RRRR"
          maxLength={10}
          aria-label={dateAriaLabel}
          aria-invalid={Boolean(dateError)}
          aria-describedby={dateError ? 'chart-date-error' : undefined}
          value={draft[`${period}Date`]}
          onChange={onChange}
        />
      </label>
      <label>
        <span>Godzina</span>
        <input
          className="chart-date-input--time"
          type="text"
          name={`${period}Time`}
          inputMode="numeric"
          placeholder="HH:MM"
          maxLength={5}
          aria-label={timeAriaLabel}
          aria-invalid={Boolean(dateError)}
          aria-describedby={dateError ? 'chart-date-error' : undefined}
          value={draft[`${period}Time`]}
          onChange={onChange}
        />
      </label>
    </div>
  </fieldset>
);

export const ChartDateFilter = ({
  series,
  selectedSeriesIds,
  onApply,
  onReset,
}) => {
  const [draft, setDraft] = useState(INITIAL_DATE_FILTER_DRAFT);
  const [draftSelectedSeriesIds, setDraftSelectedSeriesIds] =
    useState(selectedSeriesIds);
  const [dateError, setDateError] = useState('');
  const allSeriesIds = series.map((item) => String(item.id));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateDateFilterDraft(draft);
    if (validation.error) {
      setDateError(validation.error);
      return;
    }

    setDateError('');
    onApply({
      dateRange: validation.dateRange,
      selectedSeriesIds: draftSelectedSeriesIds,
    });
  };

  const handleReset = () => {
    setDraft(INITIAL_DATE_FILTER_DRAFT);
    setDraftSelectedSeriesIds(allSeriesIds);
    setDateError('');
    onReset();
  };

  const handleSeriesToggle = (seriesId) => {
    setDraftSelectedSeriesIds((currentIds) =>
      currentIds.includes(seriesId)
        ? currentIds.filter((id) => id !== seriesId)
        : [...currentIds, seriesId],
    );
  };

  const handleSelectAllSeries = () => {
    setDraftSelectedSeriesIds(allSeriesIds);
  };

  const handleClearAllSeries = () => {
    setDraftSelectedSeriesIds([]);
  };

  return (
    <>
      <form
        className="chart-date-filters"
        aria-label="Filtr daty i godziny"
        onSubmit={handleSubmit}
      >
        <DateTimeFieldset
          label="Od"
          period="from"
          dateAriaLabel="Data początkowa, format dzień, miesiąc, rok"
          timeAriaLabel="Godzina początkowa, format 24-godzinny"
          draft={draft}
          dateError={dateError}
          onChange={handleChange}
        />
        <DateTimeFieldset
          label="Do"
          period="to"
          dateAriaLabel="Data końcowa, format dzień, miesiąc, rok"
          timeAriaLabel="Godzina końcowa, format 24-godzinny"
          draft={draft}
          dateError={dateError}
          onChange={handleChange}
        />
        {series.length > 0 && (
          <SeriesSelector
            series={series}
            selectedSeriesIds={draftSelectedSeriesIds}
            onToggle={handleSeriesToggle}
            onSelectAll={handleSelectAllSeries}
            onClearAll={handleClearAllSeries}
          />
        )}
        <button type="submit">Filtruj</button>
        <button
          type="button"
          className="chart-reset-button"
          onClick={handleReset}
        >
          Wyczyść
        </button>
      </form>
      {dateError && (
        <p id="chart-date-error" className="chart-date-error" role="alert">
          {dateError}
        </p>
      )}
    </>
  );
};
