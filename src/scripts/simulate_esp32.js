const axios = require('axios');

const API_URL = 'http://localhost:3000/api/data';
const DEVICE_ID = 'UNIT-7x-ALPHA';
const API_KEY = 'your-device-api-key'; // You will get this from the dashboard after registration

let energy = 0;

async function sendData() {
  const voltage = 230 + Math.random() * 10;
  const current = Math.random() * 5;
  const power = voltage * current * 0.95; // Assuming 0.95 PF
  energy += (power / 3600000) * 5; // 5 seconds of energy in kWh

  const data = {
    deviceId: DEVICE_ID,
    apiKey: API_KEY,
    voltage: Number(voltage.toFixed(2)),
    current: Number(current.toFixed(2)),
    power: Number(power.toFixed(2)),
    energy: Number(energy.toFixed(6)),
    frequency: 50 + Math.random() * 0.5,
    powerFactor: 0.95
  };

  try {
    const res = await axios.post(API_URL, data);
    console.log(`[${new Date().toLocaleTimeString()}] Data Sent: ${data.power}W | Relay: ${res.data.command} | Balance: ₹${res.data.balance}`);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Error: ${err.response?.data?.error || err.message}`);
  }
}

console.log('Starting ESP32 Simulation...');
setInterval(sendData, 5000);
