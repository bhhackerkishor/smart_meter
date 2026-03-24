/**
 * Tamil Nadu Residential Slab Calculation
 * First 100 units: free
 * 101–200: ₹2.35/unit
 * 201–400: ₹4.70/unit
 * 401–500: ₹6.30/unit
 * 501–600: ₹8.40/unit
 * 601–800: ₹9.45/unit
 * 801–1000: ₹10.50/unit
 * Above 1000: ₹11.55/unit
 * Fixed: ₹30, Tax: 5%
 */
export function calculateResidentialBill(units: number) {
  let bill = 0;
  let remaining = units;

  const slabs = [
    { limit: 100, rate: 0 },
    { limit: 100, rate: 2.35 },
    { limit: 200, rate: 4.70 },
    { limit: 100, rate: 6.30 },
    { limit: 100, rate: 8.40 },
    { limit: 200, rate: 9.45 },
    { limit: 200, rate: 10.50 },
    { limit: Infinity, rate: 11.55 },
  ];

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const consumption = Math.min(remaining, slab.limit);
    bill += consumption * slab.rate;
    remaining -= consumption;
  }

  const fixedCharge = 30;
  bill += fixedCharge;
  
  const tax = bill * 0.05;
  const total = bill + tax;

  return {
    energyCharge: bill - fixedCharge,
    fixedCharge,
    tax,
    total: Number(total.toFixed(2))
  };
}

/**
 * Commercial Billing
 * Energy charge: ₹7.5 per kWh
 * Demand charge: ₹150 per kVA
 * Fixed charge: ₹100
 * Penalty: PF < 0.9 -> 2% penalty
 * TOD: 6 PM to 10 PM -> +10% energy charge
 */
export function calculateCommercialBill(units: number, kva: number, pf: number, timestamp: Date = new Date()) {
  let energyRate = 7.5;
  const fixedCharge = 100;
  const demandRate = 150;

  // TOD Tariff: 6 PM (18:00) to 10 PM (22:00)
  const hour = timestamp.getHours();
  if (hour >= 18 && hour < 22) {
    energyRate *= 1.1; // +10%
  }

  let energyCharge = units * energyRate;
  const demandCharge = kva * demandRate;

  // PF Penalty
  if (pf < 0.9) {
    energyCharge *= 1.02; // +2% penalty
  }

  const total = energyCharge + demandCharge + fixedCharge;

  return {
    energyCharge: Number(energyCharge.toFixed(2)),
    demandCharge: Number(demandCharge.toFixed(2)),
    fixedCharge,
    total: Number(total.toFixed(2))
  };
}
