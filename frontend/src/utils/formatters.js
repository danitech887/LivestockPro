/**
 * Format currency with customizable currency symbols
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format dates cleanly for agricultural logs
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (format === 'full') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Relative time calculation (e.g. '2 hours ago', 'Yesterday')
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return formatDate(dateString, 'short');
};

/**
 * Format weight with units
 */
export const formatWeight = (kg, unit = 'kg') => {
  if (kg === undefined || kg === null) return '0 kg';
  if (unit === 'lbs') {
    return `${(kg * 2.20462).toFixed(1)} lbs`;
  }
  return `${Number(kg).toFixed(1)} kg`;
};

/**
 * Format milk volume with units
 */
export const formatVolume = (liters, unit = 'L') => {
  if (liters === undefined || liters === null) return '0.0 L';
  if (unit === 'gal') {
    return `${(liters * 0.264172).toFixed(1)} gal`;
  }
  return `${Number(liters).toFixed(1)} L`;
};

/**
 * Helper to get age from birthdate in years and months
 */
export const calculateAge = (birthDateString) => {
  if (!birthDateString) return 'Unknown';
  const birth = new Date(birthDateString);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years === 0) {
    return `${months} mo`;
  }
  return `${years}y ${months}m`;
};
