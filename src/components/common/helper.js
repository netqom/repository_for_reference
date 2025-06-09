export const generateSku = () => {
  const prefix = 'SKU'; // You can change this prefix as needed
  const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `${prefix}${randomNumber}`;
};


export const generateSlug = (productName) => {
  return productName?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

/** Capitalize First Letter of Each Word */
export const toTitleCase = (str) => {
  return str?.replace(/\w\S*/g, (txt) => {
    return txt?.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export function calculateTierValue(costPrice, currentExchangeRate, tierAddOn, tierMultiplyBy) {
  const price = Number(costPrice);
  const exchangeRate = Number(currentExchangeRate);
  const addOn = Number(tierAddOn);
  const multiplier = Number(tierMultiplyBy);
  if (exchangeRate === 0) {
    return 0;
  }

  const base = price / exchangeRate;
  const result = ((base + addOn) * 1.20) * (multiplier/100);
  return parseFloat(result.toFixed(2));
}

// New function specifically for new variant tier calculations
export function calculateNewVariantTierValue(costPrice, currentExchangeRate, tier) {
  const price = Number(costPrice) || 0;
  const exchangeRate = Number(currentExchangeRate) || 1.17;

  // Default values for new variants
  const tierDefaults = {
    'fifth': { addOn: 10, multiplyBy: 140 },   // Under 30 sq.m: (((CostPrice/ExchangeRate)+10)*120%)*140%
    'fourth': { addOn: 7, multiplyBy: 135 },    // 30-51 sq.m: (((CostPrice/ExchangeRate)+7)*120%)*135%
    'third': { addOn: 6, multiplyBy: 130 },     // 51-153 sq.m: (((CostPrice/ExchangeRate)+6)*120%)*130%
    'second': { addOn: 4, multiplyBy: 125 },    // 153-1300 sq.m: (((CostPrice/ExchangeRate)+4)*120%)*125%
    'first': { addOn: 2, multiplyBy: 120 }      // Over 1300 sq.m: (((CostPrice/ExchangeRate)+2)*120%)*120%
  };

  const tierConfig = tierDefaults[tier];
  if (!tierConfig) return 0;

  const base = price / exchangeRate;
  const result = ((base + tierConfig.addOn) * 1.20) * (tierConfig.multiplyBy/100);
  return parseFloat(result.toFixed(2));
}

