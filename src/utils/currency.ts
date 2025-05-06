
// Currency conversion utility
// Current BDT to USD exchange rate (approximate)
const USD_TO_BDT_RATE = 110.5; 

export const convertUsdToBdt = (amountUsd: number): number => {
  return amountUsd * USD_TO_BDT_RATE;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'BDT' = 'USD'): string => {
  if (currency === 'BDT') {
    return `৳${amount.toFixed(2)}`;
  }
  return `$${amount.toFixed(2)}`;
};
