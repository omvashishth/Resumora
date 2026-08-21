export const formatDateRange = (
  startDate?: string,
  endDate?: string,
  current?: boolean
): string => {
  if (!startDate && !endDate && !current) return '';

  const formatMonthYear = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const [year, month] = dateStr.split('-');
      if (!year) return dateStr;
      if (!month) return year;
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthIdx = parseInt(month, 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${monthNames[monthIdx]} ${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const startFormatted = formatMonthYear(startDate);
  const endFormatted = current ? 'Present' : formatMonthYear(endDate);

  if (startFormatted && endFormatted) {
    return `${startFormatted} – ${endFormatted}`;
  }
  if (startFormatted) {
    return startFormatted;
  }
  if (endFormatted) {
    return endFormatted;
  }
  return '';
};

export const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
