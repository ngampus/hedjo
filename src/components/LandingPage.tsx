/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Leaf, BarChart3, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" id="landing-page">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-800 text-white p-2 rounded-xl">
              <Leaf className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-emerald-950">Hedjo</span>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-medium font-mono">SaaS</span>
          </div>
          <button 
            onClick={onGetStarted}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1 text-sm cursor-pointer"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-1.5 self-start bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-emerald-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              SME Carbon Accounting &amp; ESG Insights
            </div>
            <h1 className="text-4xl sm:text-5xl font-sans font-extrabold tracking-tight text-slate-900 leading-tight">
              Measure, Manage, and Abate Your <span className="text-emerald-800">Carbon Footprint</span> with Gemini AI
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Hedjo (“green” in Sunda) is an agile climate-tech SaaS tailored for businesses in Indonesia and Southeast Asia. Easily calculate Scope 1, 2, and 3 emissions aligned with the GHG Protocol regulations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button 
                onClick={onGetStarted}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-lg px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                Access Dashboard <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="#features" 
                className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-medium text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-1"
              >
                Learn More
              </a>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 mt-4">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-sans">100%</div>
                <div className="text-sm text-slate-500">GHG Aligned</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-sans">&lt; 15 mins</div>
                <div className="text-sm text-slate-500">Fast Setup</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-sans">MEMR</div>
                <div className="text-sm text-slate-500">Indonesia Grid Ready</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-semibold text-slate-600 font-mono">HEDJO LIVE EMISSIONS DEMO</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-md">Drafting Period</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Annual Carbon Inventory</div>
                <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">77.961 <span className="text-lg font-sans font-medium text-slate-500">tCO₂e</span></div>
              </div>

              {/* Progress Bars for Scopes */}
              <div className="flex flex-col gap-3 my-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Scope 1 (Direct Fuel &amp; AC leaks)</span>
                    <span className="font-mono">19.578 tCO₂e (25.1%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '25.1%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Scope 2 (Electricity Consumption)</span>
                    <span className="font-mono">42.980 tCO₂e (55.1%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '55.1%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Scope 3 (Supply Chain &amp; Travels)</span>
                    <span className="font-mono">15.403 tCO₂e (19.8%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-600 h-full rounded-full" style={{ width: '19.8%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 mt-1">
                <Cpu className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 leading-relaxed font-sans">
                  <strong>Gemini Recommendation:</strong> Subscribing to PLN Renewable Energy Certificates (RECs) will instantly eliminate Scope 2 footprints at SCBD offices.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features List Section */}
      <section id="features" className="bg-white py-20 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
              Tailored Carbon Governance Features
            </h2>
            <p className="text-slate-600 mt-2 text-md leading-relaxed">
              Hedjo translates raw utility parameters into actionable sustainability disclosures using robust emission indexes and localized guidelines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl self-start">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-emerald-950 font-sans">3-Scope Accountability</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log stationary &amp; mobile fuel (Scope 1), local electricity meters (Scope 2), and business travels or hardware purchasing (Scope 3).
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="p-3 bg-teal-100 text-teal-800 rounded-xl self-start">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-teal-950 font-sans">Interactive Insights</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track footprints via stacked records and check month-by-month emissions profiles. No complex setup, instantly see progress.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl self-start">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-emerald-950 font-sans">Gemini Intelligence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your aggregated carbon report to Gemini to draft audit-grade mitigation blueprints, tax alerts, and savings advice.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="p-3 bg-cyan-100 text-cyan-800 rounded-xl self-start">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-cyan-950 font-sans">Compliance Export</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Instantly copy clean Markdown for corporate slide decks or activate the print-friendly mode for audit disclosure reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Footing Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1">
            <span className="font-bold text-emerald-900">Hedjo</span> — Climate Tech Carbon Accounting Accelerator
          </div>
          <div>
            Powered by Google Cloud &amp; Gemini 3.5-flash
          </div>
        </div>
      </footer>
    </div>
  );
}
