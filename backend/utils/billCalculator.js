/**
 * Calculate electricity bill based on slab rates
 * First 100 units -> ₹3 per unit
 * 101-200 units -> ₹5 per unit
 * Above 200 units -> ₹7 per unit
 */
function calculateBill(units) {
  let bill = 0;

  if (units <= 0) {
    return 0;
  }

  if (units <= 100) {
    bill = units * 3;
  } else if (units <= 200) {
    bill = (100 * 3) + ((units - 100) * 5);
  } else {
    bill = (100 * 3) + (100 * 5) + ((units - 200) * 7);
  }

  return bill;
}

/**
 * Predict next month's unit usage based on average of last 3 months
 */
function predictNextMonth(unitsArray) {
  if (!unitsArray || unitsArray.length === 0) {
    return 0;
  }

  // If we have less than 3 months, use whatever we have
  const dataToUse = unitsArray.slice(-3); // Get last 3 months (or less if not available)
  
  const sum = dataToUse.reduce((total, units) => total + units, 0);
  return Math.round(sum / dataToUse.length); // Round to nearest integer
}

/**
 * Calculate bill with due amount
 */
function calculateTotalBill(billAmount, dueAmount) {
  return billAmount + dueAmount;
}

module.exports = {
  calculateBill,
  predictNextMonth,
  calculateTotalBill
};