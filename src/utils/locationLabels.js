export const getLocationLabel = (locId) => {
  if (locId === '1') return 'Kraków';
  if (locId === '2') return 'Warszawa';
  return locId || 'Nieznana';
};