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
