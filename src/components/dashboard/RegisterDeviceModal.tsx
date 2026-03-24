'use client';

import { useState } from 'react';
import { X, Cpu, Fingerprint, ShieldCheck, Loader2, ArrowRight, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RegisterDeviceModal({ isOpen, onClose, token, onSuccess }: { isOpen: boolean, onClose: () => void, token: string, onSuccess: () => void }) {
  const [deviceId, setDeviceId] = useState('');
  const [mode, setMode] = useState('residential');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/device/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ deviceId, mode }),
      });

      const data = await res.json();
      if (data.success) {
        setApiKey(data.apiKey);
        onSuccess();
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg glass p-8 relative overflow-hidden shadow-2xl shadow-blue-500/10"
        >
          <div className="absolute top-0 right-0 p-4">
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!apiKey ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4 border border-blue-500/30">
                  <Cpu className="text-blue-500 w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black mb-2">Register Edge Device</h2>
                <p className="text-gray-500 text-sm font-bold">Link your ESP32 + PZEM-004T to the SaaS.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Device Identifier</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-700 focus:outline-none focus:border-blue-500 transition-all font-bold"
                      placeholder="e.g. SMART-METER-001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Billing Category</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-blue-500 transition-all font-bold cursor-pointer"
                  >
                    <option value="residential">Residential (Tamil Nadu Slab)</option>
                    <option value="commercial">Commercial (TOD + Demand)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Initialize Device
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/30 mx-auto">
                <ShieldCheck className="text-green-500 w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black mb-2 text-white">Security Key Generated</h2>
              <p className="text-gray-500 font-bold mb-8">Copy this API Key to your ESP32 firmware. You won't see it again.</p>

              <div className="relative mb-10 group">
                <div className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl font-mono text-sm text-blue-400 break-all pr-12">
                  {apiKey}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>

              <button 
                onClick={onClose}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 rounded-xl font-black transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
