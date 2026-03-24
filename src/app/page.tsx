'use client';

import Link from 'next/link';
import { Zap, ShieldCheck, Cpu, Smartphone, BarChart3, Globe, ArrowRight, CheckCircle2, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-5">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2 group cursor-none">
            <Zap className="text-blue-500 w-6 h-6 fill-current glow-blue" />
            <span className="text-lg">VoltFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#billing" className="hover:text-white transition-colors">Billing Logic</a>
            <a href="#iot" className="hover:text-white transition-colors">IoT Integration</a>
            <Link href="/login" className="text-white hover:text-blue-400 transition-colors">Login</Link>
          </div>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
            Access Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Production Ready SaaS
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-[0.95] tracking-tight"
          >
            The Future of <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800">Smart Grid Edge</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            Move ALL intelligence from your meters to the cloud. Production-level observability, real-time slab-based billing, and pre-paid relay control for the next generation of utility management.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 group">
              Get Started Now
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="flex items-center gap-4 text-gray-500 font-bold uppercase tracking-widest text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-500" /> Enterprise Grade Security
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Intelligent Billing", desc: "Automated slab calculation for residential (Tamil Nadu) and commercial TOD tariffs with PF penalty detection." },
              { icon: Cpu, title: "Edge Offloading", desc: "Zero-latency computation. Offload ESP32 PZEM logic to backend services for maximum edge device efficiency." },
              { icon: ShieldCheck, title: "Prepaid Security", desc: "Native balance deduction logic with real-time relay control for credit-zero scenarios." },
              { icon: Globe, title: "Real-time Insight", desc: "WebSocket-driven live monitoring of Voltage, Current, Power, and Power Quality Alerts." },
              { icon: Smartphone, title: "Multi-tenant SaaS", desc: "Scalable architecture supporting thousands of devices per user with granular device API keys." },
              { icon: Activity, title: "Status OS", desc: "Automatic identification of Power Outages, Maintenance, Solar Export, and Overload status." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card group hover:border-blue-500/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IoT Integration Highlight */}
      <section id="iot" className="py-32 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tighter">Unified IoT Data <br/> Ingestion Protocol</h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Standardized REST-to-WebSocket pipeline for ESP32 & PZEM-004T integration. We move the heavy lifting from the microcontroller to MongoDB-backed Node.js microservices.
            </p>
            <ul className="space-y-4">
              {[
                "Device Key Authentication",
                "Sub-millisecond Billing Precision",
                "Advanced Power Quality Filtering",
                "Instant Command Response Protocol"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6 text-blue-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full max-w-xl aspect-square glass rounded-[40px] border-blue-500/20 shadow-2xl shadow-blue-500/10 flex items-center justify-center p-10 relative group overflow-hidden">
             <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors duration-500" />
             <div className="relative z-10 w-full bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Live Device Stream</span>
               </div>
               <div className="space-y-4 font-mono text-xs opacity-80">
                 <p className="text-blue-400">POST /api/data HTTP/1.1</p>
                 <p className="text-cyan-300">"deviceId": "UNIT-7x-ALPHA"</p>
                 <p className="text-green-400">"voltage": 234.5V</p>
                 <p className="text-yellow-400">"powerFact": 0.98</p>
                 <div className="h-px w-full bg-white/10 my-4" />
                 <p className="text-gray-500 italic pb-2">// Backend response in 14ms</p>
                 <p className="text-white font-bold">"command": "RELAY_ON"</p>
                 <p className="text-white font-bold">"status": "NORMAL"</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-black mb-10 leading-tight">Ready to revolutionize your <span className="text-blue-500">energy infrastructure?</span></h2>
          <Link href="/register" className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-3xl font-black text-2xl transition-all hover:scale-105 hover:bg-gray-100 group shadow-2xl shadow-white/5">
            Join the Early Access
            <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-2" />
          </Link>
          <p className="mt-8 text-gray-500 font-bold uppercase tracking-widest">No credit card required for initial setup</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 text-center text-gray-500 text-sm font-bold tracking-widest">
        <div className="flex items-center justify-center gap-2 mb-6 grayscale opacity-50">
           <Zap className="w-4 h-4 fill-current" /> VoltFlow
        </div>
        <p>&copy; 2026 VoltFlow SaaS. Built for the modern grid. Distributed architecture. Secured by Design.</p>
      </footer>
    </div>
  );
}
