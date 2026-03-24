export function detectStatus(voltage: number, current: number, power: number) {
  if (voltage < 30 && current < 0.05) return 'Power Outage';
  if (voltage > 200 && current < 0.05) return 'Maintenance';
  if (power < 0) return 'Solar Export';
  if (current > 10) return 'Overload';
  return 'Normal';
}

export function detectAlerts(voltage: number, frequency: number, pf: number) {
  const alerts: string[] = [];
  
  if (voltage > 250) alerts.push('Over Voltage');
  if (voltage < 180) alerts.push('Under Voltage');
  if (frequency > 52) alerts.push('Over Frequency');
  if (frequency < 48) alerts.push('Under Frequency');
  if (pf < 0.8) alerts.push('Low Power Factor');
  
  return alerts;
}
