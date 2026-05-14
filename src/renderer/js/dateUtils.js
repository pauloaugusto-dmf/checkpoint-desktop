export const getLocalDateString = (dateObj = new Date()) => {
  return new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
};

export const formatDayMonth = (dateString) => {
  if (!dateString) return { text: '', day: '', month: '' };
  const date = new Date(dateString + 'T00:00:00');
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
  const monthText = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return {
    text: `${day} de ${monthText}`,
    day,
    month: monthText
  };
};

export const calculateDaysLeft = (dateString) => {
  if (!dateString) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(dateString + 'T00:00:00');
  const diffTime = eventDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
