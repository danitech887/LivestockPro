/**
 * Calculate Average Daily Gain (ADG)
 * ADG = (End Weight - Start Weight) / Days between weigh-ins
 */
export const calculateADG = (weight1, date1, weight2, date2) => {
  if (!weight1 || !weight2 || !date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffDays = Math.max(1, Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
  const diffWeight = weight2 - weight1;
  return Number((diffWeight / diffDays).toFixed(2));
};

/**
 * Calculate Feed Conversion Ratio (FCR)
 * FCR = Total Feed Consumed (kg) / Total Weight Gained (kg)
 */
export const calculateFCR = (totalFeedKg, weightGainedKg) => {
  if (!totalFeedKg || !weightGainedKg || weightGainedKg <= 0) return 0;
  return Number((totalFeedKg / weightGainedKg).toFixed(2));
};

/**
 * Check if a medication withdrawal period is still active
 */
export const checkWithdrawalStatus = (treatmentDate, withdrawalDays) => {
  if (!treatmentDate || !withdrawalDays) return { active: false, daysRemaining: 0 };
  const treat = new Date(treatmentDate);
  const expiry = new Date(treat.getTime() + withdrawalDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const diffTime = expiry - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    active: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    expiryDate: expiry.toISOString().split('T')[0]
  };
};
