import { useState } from 'react';
import {
  getDateTimeTimestamp,
  isValidPolishDate,
  isValidTime,
} from './chartUtils';

const INITIAL_DRAFT = {
  fromDate: '',
  fromTime: '00:00',
  toDate: '',
  toTime: '23:59',
};

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

export const ChartDateFilter = ({ onApply, onReset }) => {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [dateError, setDateError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      (draft.fromDate && !isValidPolishDate(draft.fromDate)) ||
      (draft.toDate && !isValidPolishDate(draft.toDate))
    ) {
      setDateError('Wpisz datę w formacie DD.MM.RRRR.');
      return;
    }

    if (
      (draft.fromDate && !isValidTime(draft.fromTime)) ||
      (draft.toDate && !isValidTime(draft.toTime))
    ) {
      setDateError('Wpisz godzinę w formacie 24-godzinnym, np. 09:30.');
      return;
    }

    const fromTimestamp = getDateTimeTimestamp(draft.fromDate, draft.fromTime);
    const toTimestamp = getDateTimeTimestamp(
      draft.toDate,
      draft.toTime,
      true,
    );
    if (
      fromTimestamp !== null &&
      toTimestamp !== null &&
      fromTimestamp > toTimestamp
    ) {
      setDateError(
        'Data i godzina początkowa nie mogą być późniejsze niż końcowe.',
      );
      return;
    }

    setDateError('');
    onApply({ fromTimestamp, toTimestamp });
  };

  const handleReset = () => {
    setDraft(INITIAL_DRAFT);
    setDateError('');
    onReset();
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
