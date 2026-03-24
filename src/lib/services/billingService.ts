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
export function calculateResidentialBill(units: number, config?: any) {
  let bill = 0;
  let remaining = units;

  const resConfig = config?.residential || {
    slabs: [
      { limit: 100, rate: 0 },
      { limit: 100, rate: 2.35 },
      { limit: 200, rate: 4.70 },
      { limit: 100, rate: 6.30 },
      { limit: 100, rate: 8.40 },
      { limit: 200, rate: 9.45 },
      { limit: 200, rate: 10.50 },
      { limit: Infinity, rate: 11.55 },
    ],
    fixedCharge: 30,
    taxRate: 0.05
  };

  for (const slab of resConfig.slabs) {
    if (remaining <= 0) break;
    const consumption = Math.min(remaining, slab.limit);
    bill += consumption * slab.rate;
    remaining -= consumption;
  }

  const fixed = resConfig.fixedCharge;
  bill += fixed;
  
  const tax = bill * resConfig.taxRate;
  const total = bill + tax;

  return {
    energyCharge: Number((bill - fixed).toFixed(2)),
    fixedCharge: fixed,
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

export function calculateCommercialBill(units: number, kva: number, pf: number, timestamp: Date = new Date(), config?: any) {
  const commConfig = config?.commercial || {
    energyRate: 7.5,
    demandRate: 150,
    fixedCharge: 100,
    pfPenaltyThreshold: 0.9,
    pfPenaltyRate: 0.02,
    todTiming: { start: 18, end: 22, multiplier: 1.1 }
  };

  let energyRate = commConfig.energyRate;
  const fixedCharge = commConfig.fixedCharge;
  const demandRate = commConfig.demandRate;

  // TOD Tariff
  const hour = timestamp.getHours();
  if (hour >= commConfig.todTiming.start && hour < commConfig.todTiming.end) {
    energyRate *= commConfig.todTiming.multiplier;
  }

  let energyCharge = units * energyRate;
  const demandCharge = kva * demandRate;

  // PF Penalty
  if (pf < commConfig.pfPenaltyThreshold) {
    energyCharge *= (1 + commConfig.pfPenaltyRate);
  }

  const total = energyCharge + demandCharge + fixedCharge;

  return {
    energyCharge: Number(energyCharge.toFixed(2)),
    demandCharge: Number(demandCharge.toFixed(2)),
    fixedCharge,
    total: Number(total.toFixed(2))
  };
}
